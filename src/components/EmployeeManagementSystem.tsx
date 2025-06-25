'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, TrendingUp, Brain, FileText, Download, Filter, UserCheck, Calendar, DollarSign } from 'lucide-react';

interface PersonalityProfile {
  type: string;
  traits: string[];
  workStyle: string;
  strengths?: string;
  recommendations?: string[];
  communicationStyle?: string;
  leadershipPotential?: string;
  stressManagement?: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  personalityProfile?: PersonalityProfile;
  performanceRating?: number;
  skills?: string[];
  notes?: string;
}

const EmployeeManagementSystem = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Service', 'Design'];
  const statusOptions = ['Active', 'Inactive', 'On Leave'];

  // Sample data
  useEffect(() => {
    const sampleEmployees: Employee[] = [
      {
        id: 1,
        name: 'John Smith',
        position: 'Senior Software Engineer',
        department: 'Engineering',
        email: 'john.smith@company.com',
        phone: '(555) 123-4567',
        hireDate: '2023-01-15',
        salary: 95000,
        status: 'Active',
        performanceRating: 4.5,
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        personalityProfile: {
          type: 'Analytical Problem-Solver',
          traits: ['Detail-oriented', 'Logical thinker', 'Methodical', 'Quality-focused'],
          workStyle: 'Prefers structured environments, excels in complex technical challenges',
          strengths: 'Exceptional at debugging and system optimization',
          recommendations: ['Lead technical design reviews', 'Mentor junior developers'],
          communicationStyle: 'Direct and factual, prefers written documentation',
          leadershipPotential: 'High - natural technical leader',
          stressManagement: 'Handles pressure well when given clear requirements'
        }
      }
    ];
    setEmployees(sampleEmployees);
  }, []);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: 0,
    status: 'Active'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management System</h1>
              <p className="text-sm text-gray-600">AI-Enhanced Workforce Analytics & Management</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-800">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Active Employees</p>
                  <p className="text-2xl font-bold text-green-800">
                    {employees.filter(emp => emp.status === 'Active').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">AI Analysis</p>
                  <p className="text-2xl font-bold text-purple-800">Active</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Employee List</h3>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementSystem;
