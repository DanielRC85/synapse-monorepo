import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  readonly recipient: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsUUID('4')
  @IsNotEmpty()
  readonly tenantId: string;
}