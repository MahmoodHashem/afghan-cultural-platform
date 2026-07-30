import { Module } from "@nestjs/common";

import { MailService } from "@/common/mail/mail.service";

@Module({
  providers: [MailService],
  exports: [MailService],
})
class MailModule {}

export { MailModule };
