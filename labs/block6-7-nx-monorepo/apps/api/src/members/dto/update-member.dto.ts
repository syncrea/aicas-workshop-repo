import { IsIn } from 'class-validator';
import { MEMBER_ROLES, MemberRole } from '@aicas/shared-types';

export class UpdateMemberDto {
  @IsIn(MEMBER_ROLES)
  role!: MemberRole;
}
