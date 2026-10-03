import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { captureRef } from "react-native-view-shot";
import type { RefObject } from "react";

import { useExpenseStore } from "../store/expenseStore";
import { useGroupStore } from "../store/groupStore";

import type { Expense } from "../store/expenseStore";

/*
 * Escape text before inserting it into HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
 * Format money values.
 */
function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/*
 * Get member name from group.
 */
function getMemberName(
  group: {
    members: {
      id: string;
      name: string;
    }[];
  },
  memberId: string,
): string {
  const member = group.members.find(
    (item) => item.id === memberId,
  );

  return member?.name ?? "Unknown Member";
}

/*
 * Build HTML used for PDF generation.
 */
function buildExpenseHtml(
  expense: Expense,
): string | null {
  const group = useGroupStore
    .getState()
    .groups.find(
      (item) => item.id === expense.groupId,
    );

  if (!group) {
    return null;
  }

  /*
   * Payer
   */
  const payerName = getMemberName(
    group,
    expense.payerId,
  );

  /*
   * Category rows
   */
  const categoryRows = expense.categories
    .map(
      (category) => `
        <tr>
          <td>
            ${escapeHtml(category.name)}
          </td>

          <td class="amount">
            ${formatCurrency(category.amount)}
          </td>
        </tr>
      `,
    )
    .join("");

  /*
   * Member share rows
   */
  const shareRows = expense.shares
    .filter(
      (share) => share.share > 0,
    )
    .map((share) => {
      const memberName = getMemberName(
        group,
        share.memberId,
      );

      const isOwner =
        share.memberId ===
        expense.payerId;

      const isPaid =
        isOwner ||
        expense.payments.some(
          (payment) =>
            payment.fromMemberId ===
            share.memberId,
        );

      return `
        <tr>
          <td>
            ${escapeHtml(memberName)}
          </td>

          <td class="amount">
            ${formatCurrency(share.share)}
          </td>

          <td
            class="status ${
              isPaid ? "paid" : "due"
            }"
          >
            ${isPaid ? "PAID" : "DUE"}
          </td>
        </tr>
      `;
    })
    .join("");

  /*
   * Expense date
   */
  const date = new Date(
    expense.createdAt,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  /*
   * PDF HTML
   */
  return `
    <!DOCTYPE html>

    <html>
      <head>

        <meta
          name="viewport"
          content="width=device-width,
          initial-scale=1.0"
        />

        <style>

          @page {
            margin: 24px;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            background: #f5f7fb;
            color: #111827;

            margin: 0;
            padding: 0;
          }

          .container {
            width: 100%;
            max-width: 700px;

            margin: 0 auto;

            background: #ffffff;

            padding: 28px;

            border-radius: 16px;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .logo {
            font-size: 28px;
            font-weight: bold;

            color: #2563eb;

            margin-bottom: 6px;
          }

          .subtitle {
            font-size: 14px;
            color: #6b7280;
          }

          .group {
            text-align: center;

            font-size: 18px;
            font-weight: bold;

            margin-top: 14px;
          }

          .date {
            text-align: center;

            color: #6b7280;

            font-size: 12px;

            margin-top: 4px;
          }

          .total-box {
            background: #111827;

            color: #ffffff;

            border-radius: 14px;

            padding: 20px;

            text-align: center;

            margin: 24px 0;
          }

          .total-label {
            font-size: 13px;
            color: #d1d5db;
          }

          .total {
            font-size: 32px;
            font-weight: bold;

            margin-top: 6px;
          }

          .info {
            background: #f3f4f6;

            border-radius: 10px;

            padding: 14px;

            margin-bottom: 24px;
          }

          .info-label {
            color: #6b7280;

            font-size: 12px;
          }

          .info-value {
            font-size: 15px;
            font-weight: bold;

            margin-top: 4px;
          }

          .section-title {
            font-size: 17px;
            font-weight: bold;

            margin: 24px 0 10px;
          }

          table {
            width: 100%;

            border-collapse: collapse;
          }

          th {
            text-align: left;

            color: #6b7280;

            font-size: 12px;

            padding: 10px 8px;

            border-bottom:
              1px solid #e5e7eb;
          }

          td {
            padding: 12px 8px;

            border-bottom:
              1px solid #f1f5f9;

            font-size: 14px;
          }

          .amount {
            text-align: right;

            font-weight: bold;
          }

          .status {
            text-align: right;

            font-size: 11px;

            font-weight: bold;
          }

          .paid {
            color: #16a34a;
          }

          .due {
            color: #dc2626;
          }

          .footer {
            text-align: center;

            color: #9ca3af;

            font-size: 11px;

            margin-top: 30px;
          }

        </style>

      </head>

      <body>

        <div class="container">

          <div class="header">

            <div class="logo">
              SplitTrip
            </div>

            <div class="subtitle">
              Split expenses. Forget the calculations.
            </div>

            <div class="group">
              ${escapeHtml(group.name)}
            </div>

            <div class="date">
              ${date}
            </div>

          </div>


          <div class="total-box">

            <div class="total-label">
              TOTAL BILL
            </div>

            <div class="total">
              ${formatCurrency(
                expense.totalAmount,
              )}
            </div>

          </div>


          <div class="info">

            <div class="info-label">
              PAID BY
            </div>

            <div class="info-value">
              ${escapeHtml(payerName)}
            </div>

          </div>


          <div class="section-title">
            Categories
          </div>


          <table>

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th class="amount">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>
              ${categoryRows}
            </tbody>

          </table>


          <div class="section-title">
            Member Shares
          </div>


          <table>

            <thead>

              <tr>

                <th>
                  Member
                </th>

                <th class="amount">
                  Share
                </th>

                <th class="status">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>
              ${shareRows}
            </tbody>

          </table>


          <div class="footer">
            Generated by SplitTrip
          </div>

        </div>

      </body>
    </html>
  `;
}


/*
 * =========================================================
 * EXPORT EXPENSE AS PDF
 * =========================================================
 */

export async function exportExpenseAsPdf(
  expenseId: string,
): Promise<string | null> {
  try {
    const expense =
      useExpenseStore
        .getState()
        .expenses.find(
          (item) =>
            item.id === expenseId,
        );

    if (!expense) {
      throw new Error(
        "Expense not found.",
      );
    }

    const html =
      buildExpenseHtml(expense);

    if (!html) {
      throw new Error(
        "Group not found for this expense.",
      );
    }

    /*
     * Generate PDF and request the
     * Base64 version as well.
     *
     * This avoids the Expo Go issue where
     * the Print/...pdf URI cannot be copied.
     */
    const result =
      await Print.printToFileAsync({
        html,
        base64: true,
      });

    console.log(
      "PDF GENERATED:",
      result.uri,
    );

    if (!result.base64) {
      throw new Error(
        "PDF Base64 data was not generated.",
      );
    }

    /*
     * Create our own PDF inside the
     * application's cache directory.
     */
    const fileName =
      `SplitTrip_${Date.now()}.pdf`;

    const shareUri =
      `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(
      shareUri,
      result.base64,
      {
        encoding:
          FileSystem.EncodingType.Base64,
      },
    );

    console.log(
      "PDF READY FOR SHARING:",
      shareUri,
    );

    return shareUri;
  } catch (error) {
    console.error(
      "FAILED TO GENERATE PDF:",
      error,
    );

    throw error;
  }
}


/*
 * =========================================================
 * EXPORT EXPENSE AS IMAGE
 * =========================================================
 */

export async function exportExpenseAsImage(
  viewRef: RefObject<any>,
): Promise<string | null> {
  try {
    const uri =
      await captureRef(
        viewRef,
        {
          format: "png",
          quality: 1,
          result: "tmpfile",
        },
      );

    console.log(
      "IMAGE GENERATED:",
      uri,
    );

    return uri;
  } catch (error) {
    console.error(
      "FAILED TO GENERATE IMAGE:",
      error,
    );

    throw error;
  }
}


/*
 * =========================================================
 * SHARE FILE
 * =========================================================
 */

export async function shareFile(
  fileUri: string,
  mimeType?: string,
): Promise<void> {
  try {
    const isAvailable =
      await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error(
        "Sharing is not available on this device.",
      );
    }

    await Sharing.shareAsync(
      fileUri,
      {
        mimeType,
        dialogTitle:
          "Share SplitTrip Expense",
      },
    );

    console.log(
      "FILE SHARED:",
      fileUri,
    );
  } catch (error) {
    console.error(
      "FAILED TO SHARE FILE:",
      error,
    );

    throw error;
  }
}