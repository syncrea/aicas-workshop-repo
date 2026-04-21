import { Module } from '@nestjs/common';

import { AttachmentsModule } from '../attachments/attachments.module';
import { AuthModule } from '../auth/auth.module';
import { InvitesModule } from '../invites/invites.module';
import { MembersModule } from '../members/members.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    MembersModule,
    InvitesModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
