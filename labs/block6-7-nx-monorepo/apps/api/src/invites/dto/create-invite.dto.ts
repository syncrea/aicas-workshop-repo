import { IsEmail, IsIn } from 'class-validator';
import { MEMBER_ROLES, MemberRole } from '@aicas/shared-types';

export class CreateInviteDto {
  @IsEmail()
  email!: string;

  @IsIn(MEMBER_ROLES)
  role!: MemberRole;
}
