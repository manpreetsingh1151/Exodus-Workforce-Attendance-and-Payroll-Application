"use client";

import { Search, UserPlus } from "lucide-react";
import type { Employee } from "../types";
import { getFullName } from "../utils/format";
import { Button, Card, TextInput } from "./ui";

type NewEmployee = {
  firstName: string;
  lastName: string;
  license: string;
  phone: string;
  email: string;
  hourlyRate: string;
};

type Props = {
  employees: Employee[];
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  newEmployee: NewEmployee;
  setNewEmployee: React.Dispatch<React.SetStateAction<NewEmployee>>;
  addEmployee: (employee: NewEmployee) => Promise<boolean>;
  updateEmployee: (
    id: string,
    field: keyof Employee,
    value: string | number,
  ) => Promise<void>;
  importEmployeesFromFile: (file: File) => Promise<void>;
};

export default function EmployeesPage({
  employees,
  search,
  setSearch,
  newEmployee,
  setNewEmployee,
  addEmployee,
  updateEmployee,
  importEmployeesFromFile,
}: Props) {
  async function handleAddEmployee() {
    const success = await addEmployee(newEmployee);

    if (success) {
      setNewEmployee({
        firstName: "",
        lastName: "",
        license: "",
        phone: "",
        email: "",
        hourlyRate: "",
      });
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Import Employee CSV / Excel File
          </label>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importEmployeesFromFile(file);
            }}
            className="rounded-xl border border-slate-300 bg-white p-2 text-sm"
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <UserPlus size={20} /> Add Employee / Guard Information
        </h2>

        <div className="grid gap-3 md:grid-cols-7">
          <TextInput
            placeholder="First Name"
            value={newEmployee.firstName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, firstName: e.target.value })
            }
          />

          <TextInput
            placeholder="Last Name"
            value={newEmployee.lastName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, lastName: e.target.value })
            }
          />

          <TextInput
            placeholder="License #"
            value={newEmployee.license}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, license: e.target.value })
            }
          />

          <TextInput
            placeholder="Phone"
            value={newEmployee.phone}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, phone: e.target.value })
            }
          />

          <TextInput
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
          />

          <TextInput
            type="number"
            placeholder="Hourly rate"
            value={newEmployee.hourlyRate}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, hourlyRate: e.target.value })
            }
          />

          <Button onClick={handleAddEmployee}>Add Guard</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} />

          <TextInput
            placeholder="Search employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">First Name</th>
                <th className="p-3">Last Name</th>
                <th className="p-3">License</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Hourly Rate</th>
              </tr>
            </thead>

            <tbody>
              {employees
                .filter((employee) =>
                  `${getFullName(employee)} ${employee.license} ${employee.email} ${employee.phone} ${employee.employeeType} ${employee.employer}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((employee) => (
                  <tr key={employee.id} className="border-t">
                    <td className="p-3">
                      <TextInput
                        value={employee.firstName}
                        onChange={(e) =>
                          updateEmployee(
                            employee.id,
                            "firstName",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-3">
                      <TextInput
                        value={employee.lastName}
                        onChange={(e) =>
                          updateEmployee(
                            employee.id,
                            "lastName",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-3">
                      <TextInput
                        value={employee.license}
                        onChange={(e) =>
                          updateEmployee(
                            employee.id,
                            "license",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-3">
                      <TextInput
                        value={employee.phone}
                        onChange={(e) =>
                          updateEmployee(employee.id, "phone", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-3">
                      <TextInput
                        value={employee.email}
                        onChange={(e) =>
                          updateEmployee(employee.id, "email", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-3">
                      <TextInput
                        type="number"
                        value={employee.hourlyRate}
                        onChange={(e) =>
                          updateEmployee(
                            employee.id,
                            "hourlyRate",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}