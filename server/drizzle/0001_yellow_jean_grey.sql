CREATE TABLE `campanhas_email` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`run_id` integer NOT NULL,
	`nome` text NOT NULL,
	`assunto` text NOT NULL,
	`mensagem` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_emails` integer NOT NULL,
	`emails_enviados` integer DEFAULT 0 NOT NULL,
	`criado_em` integer NOT NULL,
	`iniciado_em` integer,
	`concluido_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `certificados` (
	`id` integer PRIMARY KEY NOT NULL,
	`run_id` integer,
	`turma_id` integer NOT NULL,
	`template_id` integer NOT NULL,
	`csv_id` integer NOT NULL,
	`linha_index` integer NOT NULL,
	`dados` text NOT NULL,
	`nome` text,
	`arquivo_url` text,
	`arquivo_id` text,
	`status` text DEFAULT 'pending',
	`generate_url` text,
	`verificado_em` integer,
	`email_enviado` integer DEFAULT 0,
	`email_destinatario` text,
	`criado_em` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`csv_id`) REFERENCES `csvs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `csvs` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`template_id` integer,
	`nome` text NOT NULL,
	`dados` text NOT NULL,
	`colunas` text NOT NULL,
	`criado_em` integer NOT NULL,
	`processado_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs_email` (
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
	FOREIGN KEY (`campanha_id`) REFERENCES `campanhas_email`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certificado_id`) REFERENCES `certificados`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`template_id` integer NOT NULL,
	`csv_id` integer NOT NULL,
	`name_column` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_alunos` integer NOT NULL,
	`certificados_gerados` integer DEFAULT 0 NOT NULL,
	`criado_em` integer NOT NULL,
	`iniciado_em` integer,
	`concluido_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`arquivo_url` text NOT NULL,
	`arquivo_id` text,
	`tipo` text DEFAULT 'html',
	`campos` text,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `turmas` (
	`id` integer PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `todos`;