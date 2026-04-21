import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description!: string | null;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR, { message: 'color must be a 6-digit hex string like #64748b' })
  color!: string | null;
}
