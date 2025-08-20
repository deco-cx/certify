PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_campanhas_email` (
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
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_campanhas_email`("id", "turma_id", "run_id", "nome", "assunto", "mensagem", "status", "total_emails", "emails_enviados", "criado_em", "iniciado_em", "concluido_em") SELECT "id", "turma_id", "run_id", "nome", "assunto", "mensagem", "status", "total_emails", "emails_enviados", "criado_em", "iniciado_em", "concluido_em" FROM `campanhas_email`;--> statement-breakpoint
DROP TABLE `campanhas_email`;--> statement-breakpoint
ALTER TABLE `__new_campanhas_email` RENAME TO `campanhas_email`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_certificados` (
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
	`status` text,
	`generate_url` text,
	`verificado_em` integer,
	`email_enviado` integer,
	`email_destinatario` text,
	`criado_em` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`csv_id`) REFERENCES `csvs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_certificados`("id", "run_id", "turma_id", "template_id", "csv_id", "linha_index", "dados", "nome", "arquivo_url", "arquivo_id", "status", "generate_url", "verificado_em", "email_enviado", "email_destinatario", "criado_em") SELECT "id", "run_id", "turma_id", "template_id", "csv_id", "linha_index", "dados", "nome", "arquivo_url", "arquivo_id", "status", "generate_url", "verificado_em", "email_enviado", "email_destinatario", "criado_em" FROM `certificados`;--> statement-breakpoint
DROP TABLE `certificados`;--> statement-breakpoint
ALTER TABLE `__new_certificados` RENAME TO `certificados`;--> statement-breakpoint
CREATE TABLE `__new_runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`template_id` integer NOT NULL,
	`csv_id` integer NOT NULL,
	`name_column` text NOT NULL,
	`status` text NOT NULL,
	`total_alunos` integer NOT NULL,
	`certificados_gerados` integer NOT NULL,
	`criado_em` integer NOT NULL,
	`iniciado_em` integer,
	`concluido_em` integer,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`csv_id`) REFERENCES `csvs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_runs`("id", "turma_id", "nome", "template_id", "csv_id", "name_column", "status", "total_alunos", "certificados_gerados", "criado_em", "iniciado_em", "concluido_em") SELECT "id", "turma_id", "nome", "template_id", "csv_id", "name_column", "status", "total_alunos", "certificados_gerados", "criado_em", "iniciado_em", "concluido_em" FROM `runs`;--> statement-breakpoint
DROP TABLE `runs`;--> statement-breakpoint
ALTER TABLE `__new_runs` RENAME TO `runs`;--> statement-breakpoint
CREATE TABLE `__new_templates` (
	`id` integer PRIMARY KEY NOT NULL,
	`turma_id` integer NOT NULL,
	`nome` text NOT NULL,
	`arquivo_url` text NOT NULL,
	`arquivo_id` text,
	`tipo` text,
	`campos` text,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL,
	FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_templates`("id", "turma_id", "nome", "arquivo_url", "arquivo_id", "tipo", "campos", "criado_em", "atualizado_em") SELECT "id", "turma_id", "nome", "arquivo_url", "arquivo_id", "tipo", "campos", "criado_em", "atualizado_em" FROM `templates`;--> statement-breakpoint
DROP TABLE `templates`;--> statement-breakpoint
ALTER TABLE `__new_templates` RENAME TO `templates`;