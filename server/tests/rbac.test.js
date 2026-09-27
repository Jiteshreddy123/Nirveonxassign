const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let adminToken;
let viewerToken;
let testEmployeeId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // 1. Create Admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Password123!',
    role: 'Admin',
  });
  adminToken = adminRes.body.token;

  // 2. Create Viewer
  const viewerRes = await request(app).post('/api/auth/register').send({
    name: 'Viewer User',
    email: 'viewer@test.com',
    password: 'Password123!',
    role: 'Viewer',
  });
  viewerToken = viewerRes.body.token;

  // 3. Create initial employee using Admin
  const empRes = await request(app)
    .post('/api/employees')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      fullName: 'John Doe',
      employeeId: 'EMP-999',
      department: 'Engineering',
      designation: 'Staff Engineer',
      email: 'john.doe@test.com',
      dateOfJoining: '2023-01-15',
      status: 'Active',
    });
  testEmployeeId = empRes.body.data._id;
});

describe('RBAC & Employee Permissions (/api/employees)', () => {
  describe('Unauthenticated Access', () => {
    it('should return 401 Unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/employees');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Viewer Permissions (Read-only)', () => {
    it('Viewer can view all employees with 200 OK', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Viewer can view individual employee details with 200 OK', async () => {
      const res = await request(app)
        .get(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('EMP-999');
    });

    it('Viewer CANNOT create employee and receives HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          fullName: 'Unauthorized Employee',
          employeeId: 'EMP-000',
          department: 'Engineering',
          designation: 'Hacker',
          email: 'unauth@test.com',
          dateOfJoining: '2023-01-01',
          status: 'Active',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('Viewer CANNOT update employee and receives HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          designation: 'Promoted By Viewer',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Viewer CANNOT delete employee and receives HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Permissions (Full CRUD)', () => {
    it('Admin can create a new employee with 201 Created', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Alice Smith',
          employeeId: 'EMP-100',
          department: 'Marketing',
          designation: 'Lead Marketer',
          email: 'alice.smith@test.com',
          dateOfJoining: '2023-05-10',
          status: 'Active',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('EMP-100');
    });

    it('Admin cannot create employee with duplicate employeeId (returns 409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Duplicate Emp',
          employeeId: 'EMP-999', // Already exists in beforeEach
          department: 'Finance',
          designation: 'Analyst',
          email: 'newemail@test.com',
          dateOfJoining: '2023-02-01',
          status: 'Active',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('Admin can update employee information with 200 OK', async () => {
      const res = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          designation: 'Principal Engineer',
          status: 'Inactive',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('Principal Engineer');
      expect(res.body.data.status).toBe('Inactive');
    });

    it('Admin can delete employee with 200 OK', async () => {
      const res = await request(app)
        .delete(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app)
        .get(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
