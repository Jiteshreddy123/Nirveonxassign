require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'Admin',
  },
  {
    name: 'Viewer User',
    email: 'viewer@example.com',
    password: 'ViewerPassword123!',
    role: 'Viewer',
  },
];

const seedEmployees = [
  {
    fullName: 'Aarav Sharma',
    employeeId: 'EMP-001',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    email: 'aarav.sharma@example.com',
    dateOfJoining: new Date('2022-03-15'),
    status: 'Active',
  },
  {
    fullName: 'Priya Patel',
    employeeId: 'EMP-002',
    department: 'Human Resources',
    designation: 'HR Lead',
    email: 'priya.patel@example.com',
    dateOfJoining: new Date('2021-08-10'),
    status: 'Active',
  },
  {
    fullName: 'Rahul Verma',
    employeeId: 'EMP-003',
    department: 'Marketing',
    designation: 'Product Marketing Manager',
    email: 'rahul.verma@example.com',
    dateOfJoining: new Date('2023-01-20'),
    status: 'Active',
  },
  {
    fullName: 'Ananya Iyer',
    employeeId: 'EMP-004',
    department: 'Engineering',
    designation: 'Full Stack Developer',
    email: 'ananya.iyer@example.com',
    dateOfJoining: new Date('2023-06-01'),
    status: 'Active',
  },
  {
    fullName: 'Vikram Singh',
    employeeId: 'EMP-005',
    department: 'Sales',
    designation: 'Sales Director',
    email: 'vikram.singh@example.com',
    dateOfJoining: new Date('2020-11-12'),
    status: 'Active',
  },
  {
    fullName: 'Sneha Kulkarni',
    employeeId: 'EMP-006',
    department: 'Finance',
    designation: 'Financial Analyst',
    email: 'sneha.kulkarni@example.com',
    dateOfJoining: new Date('2022-09-05'),
    status: 'Active',
  },
  {
    fullName: 'Karan Mehra',
    employeeId: 'EMP-007',
    department: 'Operations',
    designation: 'Operations Coordinator',
    email: 'karan.mehra@example.com',
    dateOfJoining: new Date('2023-04-18'),
    status: 'Inactive',
  },
  {
    fullName: 'Roshni Sen',
    employeeId: 'EMP-008',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    email: 'roshni.sen@example.com',
    dateOfJoining: new Date('2022-12-01'),
    status: 'Active',
  },
  {
    fullName: 'Deepak Joshi',
    employeeId: 'EMP-009',
    department: 'Sales',
    designation: 'Account Executive',
    email: 'deepak.joshi@example.com',
    dateOfJoining: new Date('2021-05-24'),
    status: 'Inactive',
  },
  {
    fullName: 'Tanvi Nair',
    employeeId: 'EMP-010',
    department: 'Design',
    designation: 'UI/UX Designer',
    email: 'tanvi.nair@example.com',
    dateOfJoining: new Date('2023-08-15'),
    status: 'Active',
  },
  {
    fullName: 'Arjun Das',
    employeeId: 'EMP-011',
    department: 'Engineering',
    designation: 'QA Automation Engineer',
    email: 'arjun.das@example.com',
    dateOfJoining: new Date('2023-10-10'),
    status: 'Active',
  },
  {
    fullName: 'Meera Rao',
    employeeId: 'EMP-012',
    department: 'Marketing',
    designation: 'Content Strategist',
    email: 'meera.rao@example.com',
    dateOfJoining: new Date('2024-02-01'),
    status: 'Active',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI is not set in environment.');
      process.exit(1);
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected.');

    // Clear existing data (safe seed)
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Employee.deleteMany({});

    // Seed users using User.create so pre-save password hashing is executed!
    console.log('[Seed] Creating default test users (Admin & Viewer)...');
    for (const u of seedUsers) {
      await User.create(u);
    }

    // Seed employees
    console.log(`[Seed] Inserting ${seedEmployees.length} sample employee records...`);
    await Employee.insertMany(seedEmployees);

    console.log('----------------------------------------------------');
    console.log(' Database seeded successfully!');
    console.log(' Admin credentials:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: AdminPassword123!');
    console.log(' Viewer credentials:');
    console.log('   Email:    viewer@example.com');
    console.log('   Password: ViewerPassword123!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
