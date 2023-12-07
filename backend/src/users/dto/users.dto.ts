import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity'

export class GetUsers extends PickType(User, [
  'id',
  'email',
  'first_name',
  'last_name',
  'full_name',
  'role',
]) {}

export class CreateAndUpdateUsers extends PickType(GetUsers, [
  'id',
  'email',
  'first_name',
  'last_name',
  'role',
]) {}

export class ExportToExcel {
  user: Array<GetUsers>;
}
