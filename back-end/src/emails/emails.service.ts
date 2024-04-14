import {Injectable, Logger} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {Email} from '../entities/email.entity';
import * as sgMail from '@sendgrid/mail';
import {InjectRepository} from '@nestjs/typeorm';
import {Raw, Repository} from 'typeorm';
import {PaginatorService} from '../paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from '../paginator/types';
import {Cron, CronExpression} from '@nestjs/schedule';
import {CreateEmailDto} from './dto/create-email.dto';
import {WosQuota} from '../entities/wos-quota.entity';

@Injectable()
export class EmailsService extends TypeOrmCrudService<Email> {
    private readonly logger = new Logger(EmailsService.name);

    constructor(
        @InjectRepository(Email)
        public emailRepository: Repository<Email>,
        private readonly paginatorService: PaginatorService,
        @InjectRepository(WosQuota)
        public wosQuotaRepository: Repository<WosQuota>,
    ) {
        super(emailRepository);
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<Email>> {
        const queryBuilder = this.emailRepository
            .createQueryBuilder('email')
            .select([
                'email.id AS id',
                'email.creation_date AS creation_date',
                'email.update_date AS update_date',
                'email.name AS name',
                'email.subject AS subject',
                'email.email AS email',
                'email.status AS status',
                'email.email_body AS email_body',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'email.id',
            'email.creation_date',
            'email.update_date',
            'email.subject',
            'email.email',
            'IF(email.status = 1, "Sent", "Not sent")',
        ], 'email.id');
    }

    async sendEmailWithSendGrid(toName: string, toEmail: string, subject: string, html: string) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        return await sgMail.send({
            to: {
                name: toName,
                email: toEmail
            },
            from: {
                email: process.env.DEFAULT_EMAIL,
                name: 'CGIAR M-QAP',
            },
            subject,
            text: html.replace(/(<([^>]+)>)/gi, ''),
            html,
        }).catch((e) => false);
    }

    async send(email: Email) {
        if (Boolean(parseInt(process.env.CAN_SEND_EMAILS))) {
            let sendGridStatus = await this.sendEmailWithSendGrid(
                email.name,
                email.email,
                email.subject,
                email.email_body,
            );
            if (sendGridStatus) {
                this.emailRepository.update(email.id, {status: true});
            }
        } else {
            this.emailRepository.update(email.id, {status: true});
        }
    }

    @Cron(CronExpression.EVERY_30_SECONDS, {
        name: 'email-notifications',
    })
    private sendEmailNotifications() {
        const dailyLimit = Number(process.env.EMAILS_DAILY_LIMIT);
        this.count({
            where: {
                creation_date: Raw(alias => `DATE(${alias}) = DATE(NOW())`)
            }
        })
            .then(emailsToday => {
                if (emailsToday >= dailyLimit) {
                    this.logger.log('Emails daily limit exceeded.');
                } else {
                    this.find({
                        where: {
                            status: false,
                        },
                        take: dailyLimit
                    })
                        .then(emails => {
                            if (emails.length) {
                                this.logger.log(`Sending ${emails.length} emails...`);
                                for (let email of emails) {
                                    this.send(email);
                                }
                            }
                        });
                }
            });
    }

    async createEmail(createEmailDto: CreateEmailDto) {
        const newEmail = this.emailRepository.create({...createEmailDto});
        return await this.emailRepository.save(newEmail);
    }

    emailTemplate(body: string) {
        return `
                <div style="height: 800px; background-color: #f7f7f7">
                    <div style="height: 150px; background-color: rgb(67, 98, 128)">
                        <img width="50" alt="CGIAR" style="margin: 30px 30px 0;" src="https://www.cgiar.org/wp/wp-content/themes/cgiar/assets/images/logo_white-9a4b0e50b1.png">
                        <h2 style="margin: 0; height: 48px; display: inline; position: absolute;color: white;top: 46px;"><b>CGIAR</b> M-QAP</h2>
                        <div style="height: 60px; width: 70%; margin: auto; background-color: #fff; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                            <h2 style="color: rgb(67, 98, 128); letter-spacing: 2px; text-align: center; margin: 15px auto 0; border-bottom: 1px solid #ebeae8; width: 70%; padding: 11px;">Notification</h2>
                        </div>
                    </div>
                    <div style="width: 70%; margin: auto; background-color: #fff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center">
                                <div style="margin-top: 50px; width: 85%; padding-bottom: 30px;">
                                ${body}
                                </div>
                            </td>
                        </tr>
                        </table>
                    </div>
                </div>
            `;
    }

    async createQuotaLimitAlertEmail(wosQuotaId: number) {
        const wosQuota = await this.wosQuotaRepository.findOne({
            where: {
                id: wosQuotaId
            },
            relations: ['responsible', 'organization']
        });
        const user = wosQuota?.responsible;
        if (!user) {
            return;
        }

        let quotaName: string;
        if (wosQuota.organization) {
            quotaName = `${wosQuota.organization?.acronym ? wosQuota.organization.acronym : wosQuota.organization.name} (${wosQuota.name})`;
        } else {
            quotaName = wosQuota.name;
        }
        let body = `<p style="font-weight: 200"> Dear ${user.full_name}
                        <br><br>Your WoS quota <b><i>${quotaName}</i></b> usage have reached the alert limit <b><i>${wosQuota.alert_on}%</i></b>.
                    </p>`;
        try {
            const email_body = this.emailTemplate(body);
            const subject = 'M-QAP WoS quota limit alert';
            return this.createEmail({
                name: user.full_name,
                subject,
                email: user.email,
                email_body
            } as CreateEmailDto);
        } catch (error) {
            console.error(error);
        }
    }
}
