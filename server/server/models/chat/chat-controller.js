export default class ChatController {
    static async sendMessage(io, req, res) {
        const details = req.body;

        console.log(details.message) // I wanna first try to send message from client and see if works

        // save message in DB...
        // (you can handle this however you like)

        // broadcast the new message to everyone in that chat
        //io.to(chatId).emit('newMessage', {
        //    chatId,
        //    senderId,
        //    message,
        //    createdAt: new Date()
        //});

        return res.status(200).json({ success: true });
    }
}