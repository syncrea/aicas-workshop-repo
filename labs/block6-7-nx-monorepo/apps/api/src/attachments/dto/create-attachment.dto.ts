import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contentType!: string;

  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @IsString()
  @IsNotEmpty()
  storageKey!: string;
}
