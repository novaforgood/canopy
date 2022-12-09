import { table } from "console";

import { flexRender, Table } from "@tanstack/react-table";
import classNames from "classnames";

import { BxsUpArrow, BxsDownArrow } from "../generated/icons/solid";

export function Table<T>({ table }: { table: Table<T> }) {
  return (
    <table className="w-full min-w-[40rem]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left">
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: classNames({
                        "bg-gray-200 p-1 transition": true,
                        "cursor-pointer select-none hover:bg-gray-100":
                          header.column.getCanSort(),
                      }),
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <BxsUpArrow className="ml-1 inline h-3 w-3" />,
                      desc: <BxsDownArrow className="ml-1 inline h-3 w-3" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="p-1">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
}
