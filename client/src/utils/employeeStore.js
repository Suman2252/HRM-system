import axios from 'axios';

class EmployeeStore {

  // Get all employees
  async getAllEmployees() {
    try {
      const response = await axios.get('/api/employees');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get employee by ID
  async getEmployeeById(id) {
    try {
      const response = await axios.get(`/api/employees/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Add new employee
  async addEmployee(employeeData) {
    try {
      const response = await axios.post('/api/employees', employeeData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  // Update employee
  async updateEmployee(id, updatedData) {
    try {
      const response = await axios.put(`/api/employees/${id}`, updatedData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  async deleteEmployee(id) {
    try {
      const response = await axios.delete(`/api/employees/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Search employees
  async searchEmployees(query) {
    try {
      const allEmployees = await this.getAllEmployees();
      const lowercaseQuery = query.toLowerCase();
      return allEmployees.filter(emp => 
        emp.firstName.toLowerCase().includes(lowercaseQuery) ||
        emp.lastName.toLowerCase().includes(lowercaseQuery) ||
        emp.email.toLowerCase().includes(lowercaseQuery) ||
        emp.employeeId.toLowerCase().includes(lowercaseQuery) ||
        emp.department.toLowerCase().includes(lowercaseQuery) ||
        emp.designation.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  // Filter employees by department
  async filterByDepartment(department) {
    try {
      const allEmployees = await this.getAllEmployees();
      if (!department) return allEmployees;
      return allEmployees.filter(emp => emp.department === department);
    } catch (error) {
      console.error('Error filtering employees:', error);
      throw error;
    }
  }

  // Get departments
  async getDepartments() {
    try {
      const allEmployees = await this.getAllEmployees();
      const departments = [...new Set(allEmployees.map(emp => emp.department))];
      return departments.sort();
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const employeeStore = new EmployeeStore();

export default employeeStore;
