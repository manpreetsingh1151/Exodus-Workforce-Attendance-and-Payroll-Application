
export function downloadCSV(
  filename: string,
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const csv = rows
    .map((row) =>
      row
        .map(
          (cell: string | number | null | undefined) =>
            `"${String(cell ?? "").replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// export async function importEmployeesFromFile(file: File) {
//     const buffer = await file.arrayBuffer();
//     const workbook = XLSX.read(buffer);

//     const rows: Record<string, unknown>[] = [];

//     workbook.SheetNames.forEach((sheetName) => {
//       if (sheetName.toUpperCase() === "INACTIVE") return;

//       const sheet = workbook.Sheets[sheetName];
//       const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
//         sheet,
//         {
//           defval: "",
//         },
//       );

//       rows.push(...sheetRows);
//     });

//     const employeesToInsert = rows
//       .map((row) => ({
//         employee_type: String(row["EMPLOYEE TYPE"] || "").trim(),
//         employer: String(row["EMPLOYER"] || "").trim(),
//         gender: String(row["GENDER"] || "").trim(),
//         first_name: String(row["FIRST NAME"] || "").trim(),
//         last_name: String(row["LAST NAME"] || "").trim(),
//         email: String(row["EMAIL ADDRESS"] || "").trim(),
//         phone: String(row["PHONE NUMBER"] || "").trim(),
//         license: String(row["LICENSE #"] || "").trim(),
//         license_expiration: String(row["LICENSE EXPIRATION"] || "").trim(),
//         hourly_rate: Number(row["PAYRATE"] || 0),
//       }))
//       .filter((employee) => employee.first_name || employee.last_name);

//     const { error } = await supabase
//       .from("employees")
//       .insert(employeesToInsert);

//     if (error) {
//       console.error(error);
//       alert("Import failed.");
//       return;
//     }

//     await loadEmployees();
//     alert(`${employeesToInsert.length} employees imported successfully.`);
//   }