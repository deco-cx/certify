CREATE TABLE `DECO_CERTIFY_campanhas_email` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`run_id` integer NOT NULL,
	`nome` text NOT NULL,
	`assunto` text NOT NULL,
	`mensagem` text NOT NULL,
	`status` text NOT NULL,
	`total_emails` integer NOT NULL,
	`emails_enviados` integer NOT NULL,
	`criado_em` integer NOT NULL,
	`iniciado_em` integer,
	`concluido_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `DECO_CERTIFY_turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`run_id`) REFERENCES `DECO_CERTIFY_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DECO_CERTIFY_certificados` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` integer,
	`turma_id` integer NOT NULL,
	`template_id` integer NOT NULL,
	`csv_id` integer NOT NULL,
	`linha_index` integer NOT NULL,
	`dados` text NOT NULL,
	`nome` text,
	`html` text,
	`status` text,
	`generate_url` text,
	`verificado_em` integer,
	`email_enviado` integer,
	`email_destinatario` text,
	`criado_em` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `DECO_CERTIFY_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`turma_id`) REFERENCES `DECO_CERTIFY_turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `DECO_CERTIFY_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`csv_id`) REFERENCES `DECO_CERTIFY_csvs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DECO_CERTIFY_csvs` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`template_id` integer,
	`nome` text NOT NULL,
	`dados` text NOT NULL,
	`colunas` text NOT NULL,
	`criado_em` integer NOT NULL,
	`processado_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `DECO_CERTIFY_turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `DECO_CERTIFY_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DECO_CERTIFY_logs_email` (
	`id` integer PRIMARY KEY NOT NULL,
	`campanha_id` integer NOT NULL,
	`certificado_id` integer NOT NULL,
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
CREATE TABLE `DECO_CERTIFY_runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`template_id` integer NOT NULL,
	`csv_id` integer NOT NULL,
	`name_column` text NOT NULL,
	`email_column` text,
	`status` text NOT NULL,
	`total_alunos` integer NOT NULL,
	`certificados_gerados` integer NOT NULL,
	`criado_em` integer NOT NULL,
	`iniciado_em` integer,
	`concluido_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `DECO_CERTIFY_turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `DECO_CERTIFY_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`csv_id`) REFERENCES `DECO_CERTIFY_csvs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DECO_CERTIFY_templates` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`html` text NOT NULL,
	`tipo` text,
	`campos` text,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL,
	FOREIGN KEY (`turma_id`) REFERENCES `DECO_CERTIFY_turmas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DECO_CERTIFY_turmas` (
	`id` integer PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL
);
