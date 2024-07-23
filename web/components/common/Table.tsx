import { flexRender } from "@tanstack/react-table";
import classNames from "classnames";

import {
  BxsUpArrow,
  BxsDownArrow,
  BxsSortAlt,
} from "../../generated/icons/solid";

import type { Table } from "@tanstack/react-table";

export function Table<T>({ table }: { table: Table<T> }) {
  return (
    <table className="relative w-full min-w-[40rem]">
      <thead className="sticky top-0" style={{ zIndex: 1 }}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left">
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: classNames({
                        "bg-gray-200 p-1 transition whitespace-nowrap flex items-center":
                          true,
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
                    <div className="flex-1"></div>
                    <div className="text-gray-700">
                      {{
                        asc: <BxsUpArrow className="ml-1 inline h-3 w-3" />,
                        desc: <BxsDownArrow className="ml-1 inline h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ??
                        (header.column.getCanSort() ? (
                          <BxsSortAlt className="ml-1 inline h-3 w-3" />
                        ) : null)}
                    </div>
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="overflow-hidden">
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
