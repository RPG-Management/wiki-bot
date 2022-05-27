import nodeHtmlToImage from "node-html-to-image";

export const createTable = async (
  headers: {
    label: string;
    centered?: boolean;
  }[],
  rows: (number | string)[][]
) => {
  const centeredIndexes = headers.map((header, index) =>
    header.centered ? index : -1
  );

  const html = `
  <html>
    <head>
      <style>
        body {
          width: fit-content;
          height: fit-content;
          font-family: sans-serif;
        }

        .wrapper{
          border-radius: .5rem;
          padding: 10px;
          background-color: #36393F;
        }

        table {
          border-collapse: collapse;
        }

        th {
          background-color: #d35400;
          color: white;
          font-weight: 300;
          padding: .5rem;
        }

        .heading {
          overflow: hidden;
        }
        

        td {
          padding: .5rem;
          color: #fff;
          white-space: nowrap;
        }

        td[value="0"] {
          color: #aaa;
        }

        td.centered {
          text-align: center;
        }

        td:first-child, th:first-child {
          border-radius: .2rem 0 0 .2rem;
        }

        td:last-child, th:last-child {
          border-radius: 0 .2rem .2rem 0;
        }

        tr:nth-child(even) {
          background-color: #ffffff33;
        }

      </style>
    </head>
    <body>
      <div class="wrapper">
        <table>
          <thead>
            <tr class="heading">
              ${headers.map((header) => `<th>${header.label}</th>`).join("")}
            </tr>
          </thead>

          ${rows
            .map(
              (row) =>
                `<tr>${row
                  .map(
                    (cell, i) =>
                      `<td value="${cell}" class="${
                        centeredIndexes.includes(i) ? "centered" : ""
                      }">${cell}</td>`
                  )
                  .join("")}</tr>`
            )
            .join("")}
        </table>
      </div>
    </body>
  </html>
  `;

  const a = await nodeHtmlToImage({
    html,
    transparent: true,
  });

  return a;
};
