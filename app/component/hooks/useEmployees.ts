"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase/client";
import type { Employee } from "../types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("first_name");

    if (error) {
      console.error(error);
      return;
    }

    setEmployees(
      (data || []).map((e) => ({
        id: String(e.id ?? ""),
        firstName: String(e.first_name ?? ""),
        lastName: String(e.last_name ?? ""),
        employeeType: String(e.employee_type ?? ""),
        employer: String(e.employer ?? ""),
        gender: String(e.gender ?? ""),
        license: String(e.license ?? ""),
        licenseExpiration: String(e.license_expiration ?? ""),
        phone: String(e.phone ?? ""),
        email: String(e.email ?? ""),
        hourlyRate: Number(e.hourly_rate ?? 0),
      })),
    );
  }

  async function addEmployee(newEmployee: {
    firstName: string;
    lastName: string;
    license: string;
    phone: string;
    email: string;
    hourlyRate: string;
  }) {
    const { error } = await supabase.from("employees").insert({
      first_name: newEmployee.firstName,
      last_name: newEmployee.lastName,
      license: newEmployee.license,
      phone: newEmployee.phone,
      email: newEmployee.email,
      hourly_rate: Number(newEmployee.hourlyRate),
    });

    if (error) {
      console.error(error);
      return false;
    }

    await loadEmployees();
    return true;
  }

  async function updateEmployee(
    id: string,
    field: keyof Employee,
    value: string | number,
  ) {
    const dbField: Record<keyof Employee, string> = {
      id: "id",
      firstName: "first_name",
      lastName: "last_name",
      employeeType: "employee_type",
      employer: "employer",
      gender: "gender",
      license: "license",
      licenseExpiration: "license_expiration",
      phone: "phone",
      email: "email",
      hourlyRate: "hourly_rate",
    };

    const { error } = await supabase
      .from("employees")
      .update({
        [dbField[field]]: field === "hourlyRate" ? Number(value) : value,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadEmployees();
  }

  async function importEmployeesFromFile(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const rows: Record<string, unknown>[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      if (sheetName.toUpperCase() === "INACTIVE") return;

      const sheet = workbook.Sheets[sheetName];
      const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      rows.push(...sheetRows);
    });

    const employeesToInsert = rows
      .map((row) => ({
        employee_type: String(row["EMPLOYEE TYPE"] || "").trim(),
        employer: String(row["EMPLOYER"] || "").trim(),
        gender: String(row["GENDER"] || "").trim(),
        first_name: String(row["FIRST NAME"] || "").trim(),
        last_name: String(row["LAST NAME"] || "").trim(),
        email: String(row["EMAIL ADDRESS"] || row["EMAIL"] || "").trim(),
        phone: String(row["PHONE NUMBER"] || row["PHONE"] || "").trim(),
        license: String(row["LICENSE #"] || row["LICENSE"] || "").trim(),
        license_expiration: String(row["LICENSE EXPIRATION"] || "").trim(),
        hourly_rate: Number(
          row["PAYRATE"] || row["PAY RATE"] || row["HOURLY RATE"] || 0,
        ),
      }))
      .filter((employee) => employee.first_name || employee.last_name);

    const { error } = await supabase.from("employees").insert(employeesToInsert);

    if (error) {
      console.error(error);
      alert("Import failed.");
      return;
    }

    await loadEmployees();
    alert(`${employeesToInsert.length} employees imported successfully.`);
  }

  return {
    employees,
    loadEmployees,
    addEmployee,
    updateEmployee,
    importEmployeesFromFile,
  };
}