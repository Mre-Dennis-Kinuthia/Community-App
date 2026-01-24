# Prisma Schema Additions

Add these models to your `schema.prisma` file:

```prisma
// Billing & Subscriptions
model Subscription {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId        String
  plan          Plan     @relation(fields: [planId], references: [id])
  status        String   // active, cancelled, expired, trialing
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  payments      Payment[]
  invoices      Invoice[]

  @@map("subscriptions")
}

model Plan {
  id            String   @id @default(cuid())
  name          String
  description   String?  @db.Text
  price         Decimal
  currency      String   @default("KES")
  interval      String   // monthly, yearly
  features      Json     // Array of feature strings
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  subscriptions Subscription[]

  @@map("plans")
}

model Payment {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionId String?
  subscription  Subscription? @relation(fields: [subscriptionId], references: [id])
  amount        Decimal
  currency      String   @default("KES")
  method        String   // mpesa, card, bank_transfer
  status        String   // pending, completed, failed, refunded
  transactionId String?
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  invoice      Invoice?

  @@map("payments")
}

model PaymentMethod {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          String   // card, mpesa, bank_account
  provider      String   // safaricom, stripe, etc.
  last4         String?
  brand         String?
  expiryMonth   Int?
  expiryYear    Int?
  isDefault     Boolean  @default(false)
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@map("payment_methods")
}

model Invoice {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionId String?
  subscription  Subscription? @relation(fields: [subscriptionId], references: [id])
  paymentId     String?  @unique
  payment       Payment? @relation(fields: [paymentId], references: [id])
  invoiceNumber String   @unique
  amount        Decimal
  currency      String   @default("KES")
  status        String   // draft, paid, overdue, cancelled
  dueDate       DateTime?
  paidAt        DateTime?
  pdfUrl        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("invoices")
}

// Partners
model Partner {
  id                String   @id @default(cuid())
  name              String
  type              String   // Workspace Partner, Investor, Partner, Funder, Government, Network
  category          String   // Infrastructure, Funding, Ecosystem, Public Sector
  description       String?  @db.Text
  logo              String?
  website           String?
  location          String?
  locationType      String   // Local, Global
  focus             String[] // Array of focus areas
  impact            String?  @db.Text
  benefits          String[] // Array of benefits
  partnershipTier   String   // Strategic Partner, Supporting Partner, Network Partner
  contactEmail      String?
  isActive          Boolean  @default(true)
  isFeatured        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  opportunities     PartnerOpportunity[]

  @@map("partners")
}

model PartnerOpportunity {
  id            String   @id @default(cuid())
  partnerId     String
  partner       Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  title         String
  description   String   @db.Text
  category      String   // Funding, Program, Resource
  amount        String?  // e.g., "$50K - $2M"
  deadline      DateTime?
  eligibility   String[] // Array of eligibility requirements
  applicationProcess String[] @db.Text // Array of process steps
  status        String   // Open, Closed, Ongoing
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@map("partner_opportunities")
}

// Projects
model Project {
  id                    String   @id @default(cuid())
  title                 String
  description           String   @db.Text
  category              String   // Climate & Environment, Agriculture, etc.
  stage                 String   // Early Stage, Growth, Scaling
  impact                String?  @db.Text
  metrics                Json?    // Object with metrics
  tags                  String[]
  founderId             String
  founder               User     @relation(fields: [founderId], references: [id], onDelete: Cascade)
  location              String?
  needs                 String[] // Seeking Funding, Seeking Collaborators, etc.
  website               String?
  socialLinks           Json?    // Object with social links
  launchDate            DateTime?
  isFeatured            Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  deletedAt             DateTime?

  followers             ProjectFollow[]
  volunteers            ProjectVolunteer[]
  collaborationRequests ProjectCollaboration[]

  @@map("projects")
}

model ProjectFollow {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([projectId, userId])
  @@map("project_follows")
}

model ProjectVolunteer {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    String   @default("pending") // pending, accepted, rejected
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, userId])
  @@map("project_volunteers")
}

model ProjectCollaboration {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  message   String?  @db.Text
  status    String   @default("pending") // pending, accepted, rejected
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, userId])
  @@map("project_collaborations")
}

// Update User model to include new relations:
// Add these to the existing User model:
//   subscriptions Subscription[]
//   payments      Payment[]
//   paymentMethods PaymentMethod[]
//   invoices      Invoice[]
//   projects      Project[]
//   projectFollows ProjectFollow[]
//   projectVolunteers ProjectVolunteer[]
//   projectCollaborations ProjectCollaboration[]
```
