import { IsIn, IsString } from 'class-validator';
import { MEMBER_ROLES, MemberRole } from '@aicas/shared-types';

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsIn(MEMBER_ROLES)
  role!: MemberRole;
}
