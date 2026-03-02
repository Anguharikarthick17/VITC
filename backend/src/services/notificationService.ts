import { Complaint } from '@prisma/client';

export const notifyCriticalComplaint = (complaint: Complaint): void => {
    console.log('🚨 =============================================');
    console.log('🚨 CRITICAL COMPLAINT ALERT');
    console.log(`🚨 ID: ${complaint.id}`);
    console.log(`🚨 Title: ${complaint.title}`);
    console.log(`🚨 State: ${complaint.state}`);
    console.log(`🚨 City: ${complaint.city}`);
    console.log(`🚨 Contact: ${complaint.email}`);
    console.log('🚨 =============================================');

    // TODO: Integrate Nodemailer for actual email alerts
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   to: 'admin@gmail.com',
    //   subject: `CRITICAL: ${complaint.title}`,
    //   html: `...`,
    // });
};
