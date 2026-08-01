const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/setup.sql', 'utf8');

const target = `CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`items_json\` LONGTEXT NOT NULL,
  \`subtotal\` DECIMAL(10, 2) NOT NULL,
  \`tax\` DECIMAL(10, 2) NOT NULL,
  \`total\` DECIMAL(10, 2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'USD',
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'Processing',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

const replacement = `CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`user_email\` VARCHAR(150) NULL,
  \`items_json\` LONGTEXT NOT NULL,
  \`subtotal\` DECIMAL(10, 2) NOT NULL,
  \`tax\` DECIMAL(10, 2) NOT NULL,
  \`total\` DECIMAL(10, 2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'USD',
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'Processing',
  \`payment_method\` VARCHAR(50) DEFAULT 'Cash on Delivery',
  \`payment_details\` LONGTEXT NULL,
  \`payment_status\` VARCHAR(50) DEFAULT 'Pending',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('backend-php-mysql/setup.sql', code);
    console.log("Updated setup.sql");
} else {
    console.log("Could not find target in setup.sql");
}
