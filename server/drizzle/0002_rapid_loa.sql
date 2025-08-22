PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_DECO_CERTIFY_logs_email` (
	`id` integer PRIMARY KEY NOT NULL,
	`campanha_id` integer NOT NULL,
	`certificado_id` text NOT NULL,
	`email_destinatario` text NOT NULL,
	`assunto` text NOT NULL,
	`mensagem` text NOT NULL,
	`status` text NOT NULL,
	`resend_id` text,
	`erro` text,
	`enviado_em` integer NOT NULL,
	FOREIGN KEY (`campanha_id`) REFERENCES `DECO_CERTIFY_campanhas_email`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certificado_id`) REFERENCES `DECO_CERTIFY_certificados`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_DECO_CERTIFY_logs_email`("id", "campanha_id", "certificado_id", "email_destinatario", "assunto", "mensagem", "status", "resend_id", "erro", "enviado_em") SELECT "id", "campanha_id", "certificado_id", "email_destinatario", "assunto", "mensagem", "status", "resend_id", "erro", "enviado_em" FROM `DECO_CERTIFY_logs_email`;--> statement-breakpoint
DROP TABLE `DECO_CERTIFY_logs_email`;--> statement-breakpoint
ALTER TABLE `__new_DECO_CERTIFY_logs_email` RENAME TO `DECO_CERTIFY_logs_email`;--> statement-breakpoint
PRAGMA foreign_keys=ON;