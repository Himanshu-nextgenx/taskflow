import { Worker } from "bullmq";
import connection from "../../config/redis";
import transporter from "../../config/nodemailer";

const emailWorker = new Worker(
  "email-notifications",

  async (job) => {
    const { to, taskId, taskTitle } = job.data;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Task assigned: ${taskTitle}`,
      text: `You have been assigned to the task "${taskTitle}".\n\nTask ID: ${taskId}`,
    });

    console.log(`📧 Email sent to ${to}`);

    return { success: true };
  },

  { connection }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`);
});

export default emailWorker;