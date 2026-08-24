
import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";


async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123", 12);

  // ===== Organization 1 =====
  const org1 = await prisma.organization.create({ data: { name: "Infosys" } });

  const raj = await prisma.user.create({
    data: { name: "Raj Kumar", email: "raj@infosys.com", password: passwordHash },
  });
  const simran = await prisma.user.create({
    data: { name: "Simran Kaur", email: "simran@infosys.com", password: passwordHash },
  });
  const aman = await prisma.user.create({
    data: { name: "Aman Singh", email: "aman@infosys.com", password: passwordHash },
  });

  await prisma.orgMember.createMany({
    data: [
      { userId: raj.id, organizationId: org1.id, role: "org_admin" },
      { userId: simran.id, organizationId: org1.id, role: "member" },
      { userId: aman.id, organizationId: org1.id, role: "member" },
    ],
  });

  // ===== Organization 2 =====
  const org2 = await prisma.organization.create({ data: { name: "TCS" } });

  const priya = await prisma.user.create({
    data: { name: "Priya Sharma", email: "priya@tcs.com", password: passwordHash },
  });
  const karan = await prisma.user.create({
    data: { name: "Karan Mehta", email: "karan@tcs.com", password: passwordHash },
  });

  await prisma.orgMember.createMany({
    data: [
      { userId: priya.id, organizationId: org2.id, role: "org_admin" },
      { userId: karan.id, organizationId: org2.id, role: "member" },
    ],
  });

  // ===== Projects (Org 1) =====
  const project1 = await prisma.project.create({
    data: { name: "Website Redesign", description: "Company website overhaul", organizationId: org1.id },
  });
  const project2 = await prisma.project.create({
    data: { name: "Mobile App", description: "New mobile application", organizationId: org1.id },
  });

  // ===== Projects (Org 2) =====
  const project3 = await prisma.project.create({
    data: { name: "CRM System", description: "Internal CRM tool", organizationId: org2.id },
  });

  // ===== Tasks (Project 1 - Website Redesign) =====
  const task1 = await prisma.task.create({
    data: { title: "Design homepage", description: "Create new homepage mockup", status: "todo", priority: "high", projectId: project1.id, dueDate: new Date("2026-09-15") },
  });
  const task2 = await prisma.task.create({
    data: { title: "Fix navbar bug", description: "Navbar breaks on mobile", status: "in_progress", priority: "urgent", projectId: project1.id, dueDate: new Date("2026-09-10") },
  });
  const task3 = await prisma.task.create({
    data: { title: "SEO optimization", description: "Improve page load speed", status: "review", priority: "medium", projectId: project1.id, dueDate: new Date("2026-09-20") },
  });
  const task4 = await prisma.task.create({
    data: { title: "Update footer links", description: "Footer links outdated", status: "done", priority: "low", projectId: project1.id },
  });

  // ===== Tasks (Project 2 - Mobile App) =====
  const task5 = await prisma.task.create({
    data: { title: "Setup React Native", description: "Initialize mobile project", status: "done", priority: "high", projectId: project2.id },
  });
  const task6 = await prisma.task.create({
    data: { title: "Login screen UI", description: "Design login flow", status: "in_progress", priority: "medium", projectId: project2.id, dueDate: new Date("2026-09-25") },
  });
  const task7 = await prisma.task.create({
    data: { title: "Push notifications", description: "Integrate FCM", status: "todo", priority: "medium", projectId: project2.id },
  });

  // ===== Tasks (Project 3 - CRM, Org 2) =====
  const task8 = await prisma.task.create({
    data: { title: "Customer dashboard", description: "Build analytics dashboard", status: "todo", priority: "high", projectId: project3.id },
  });
  const task9 = await prisma.task.create({
    data: { title: "Lead tracking module", description: "Track sales leads", status: "in_progress", priority: "urgent", projectId: project3.id },
  });
  const task10 = await prisma.task.create({
    data: { title: "Email integration", description: "Connect email service", status: "review", priority: "low", projectId: project3.id },
  });
  const task11 = await prisma.task.create({
    data: { title: "User roles setup", description: "Define permission levels", status: "done", priority: "medium", projectId: project3.id },
  });

  // ===== Assignments =====
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: task1.id, userId: simran.id },
      { taskId: task2.id, userId: aman.id },
      { taskId: task3.id, userId: simran.id },
      { taskId: task5.id, userId: aman.id },
      { taskId: task6.id, userId: simran.id },
      { taskId: task8.id, userId: karan.id },
      { taskId: task9.id, userId: priya.id },
    ],
  });

  // ===== Comments =====
  await prisma.comment.createMany({
    data: [
      { taskId: task1.id, authorId: raj.id, content: "Please prioritize this for the sprint." },
      { taskId: task2.id, authorId: simran.id, content: "I found the root cause, fixing now." },
      { taskId: task9.id, authorId: priya.id, content: "This is blocking the release, need urgent update." },
    ],
  });

  console.log("Seeding completed!");
  console.log("Test login: raj@infosys.com / Password123 (org_admin, Infosys)");
  console.log("Test login: priya@tcs.com / Password123 (org_admin, TCS)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });