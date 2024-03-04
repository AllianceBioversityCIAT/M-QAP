import {Injectable} from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

@Injectable()
export class SocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    trainingProgressSockets = [];

    handleDisconnect(client: Socket) {
        const type = client.handshake?.query?.type;
        const clientIndex = this.trainingProgressSockets.indexOf(client.id);
        if (type === 'training_progress' && clientIndex !== -1) {
            this.trainingProgressSockets.splice(clientIndex, 1);
        }
    }

    handleConnection(client: Socket, ...args: any[]) {
        const type = client.handshake?.query?.type;
        if (type === 'training_progress') {
            this.trainingProgressSockets.push(client.id)
        }
    }

    emitTrainingProgress(progress, process, trainingInProgress) {
        for (const socketId of this.trainingProgressSockets) {
            this.server.in(socketId).emit('training_progress', {
                progress,
                process,
                trainingInProgress,
            });
        }
    }
}
