<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250924152917 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE project_section (project_id INT NOT NULL, section_id INT NOT NULL, INDEX IDX_BB6D768A166D1F9C (project_id), INDEX IDX_BB6D768AD823E37A (section_id), PRIMARY KEY(project_id, section_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE project_section ADD CONSTRAINT FK_BB6D768A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_section ADD CONSTRAINT FK_BB6D768AD823E37A FOREIGN KEY (section_id) REFERENCES section (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE task CHANGE section_id section_id INT NOT NULL');
        $this->addSql('ALTER TABLE task ADD CONSTRAINT FK_527EDB25D823E37A FOREIGN KEY (section_id) REFERENCES section (id)');
        $this->addSql('CREATE INDEX IDX_527EDB25D823E37A ON task (section_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project_section DROP FOREIGN KEY FK_BB6D768A166D1F9C');
        $this->addSql('ALTER TABLE project_section DROP FOREIGN KEY FK_BB6D768AD823E37A');
        $this->addSql('DROP TABLE project_section');
        $this->addSql('ALTER TABLE task DROP FOREIGN KEY FK_527EDB25D823E37A');
        $this->addSql('DROP INDEX IDX_527EDB25D823E37A ON task');
        $this->addSql('ALTER TABLE task CHANGE section_id section_id VARCHAR(255) NOT NULL');
    }
}
