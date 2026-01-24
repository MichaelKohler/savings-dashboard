import { useState } from "react";
import { actions } from "astro:actions";
import Button from "~/components/button";

// Type for Balance with account relation
interface BalanceWithAccount {
  id: string;
  balance: number;
  date: Date;
  accountId: string;
  updatedAt: Date;
  account: {
    id: string;
    name: string;
  };
}

interface BalancesListProps {
  balances: BalanceWithAccount[];
}

function getMonthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupBalancesByMonth(
  balances: BalanceWithAccount[]
): Map<string, BalanceWithAccount[]> {
  const groups = new Map<string, BalanceWithAccount[]>();

  for (const balance of balances) {
    const monthKey = getMonthKey(balance.date);
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(balance);
  }

  for (const [, balances] of groups) {
    balances.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      const updatedA = new Date(a.updatedAt).getTime();
      const updatedB = new Date(b.updatedAt).getTime();

      return updatedB - updatedA;
    });
  }

  return groups;
}

export default function BalancesList({ balances }: BalancesListProps) {
  const [markedForDeletion, setMarkedForDeletion] = useState<
    Record<string, boolean>
  >({});

  const markForDeletion = (id: string) => () => {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append("balanceId", id);

    const { data, error } = await actions.deleteBalance(formData);

    if (error) {
      console.error("Failed to delete balance", error);
      return;
    }

    if (data) {
      window.location.reload();
    }
  };

  const groupedBalances = groupBalancesByMonth(balances);

  const sortedMonths = Array.from(groupedBalances.keys()).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <main>
      <a href="/balances/new">
        <Button>+ New Balance</Button>
      </a>

      {sortedMonths.map((monthKey) => {
        const monthBalances = groupedBalances.get(monthKey)!;

        return (
          <div key={monthKey} className="mt-8">
            <h2 className="text-xl font-semibold mb-3">{monthKey}</h2>

            <table className="min-w-full table-fixed">
              <thead className="border-b border-gray-300 text-left">
                <tr>
                  <th className="w-36 pr-2">Date</th>
                  <th className="pr-2">Account</th>
                  <th className="w-32 pr-2">Amount</th>
                  <th className="w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthBalances.map((balance) => (
                  <tr className="border-b border-gray-300" key={balance.id}>
                    <td className="pr-2">
                      {new Date(balance.date).toLocaleDateString()}
                    </td>
                    <td className="pr-2">{balance.account.name}</td>
                    <td className="pr-2">{balance.balance}</td>
                    <td className="text-right">
                      <a
                        href={`/balances/${balance.id}/edit`}
                        className="inline-block"
                      >
                        <Button>Edit</Button>
                      </a>
                      {!markedForDeletion[balance.id] && (
                        <span className="ml-4">
                          <Button
                            isDanger
                            onClick={markForDeletion(balance.id)}
                          >
                            X
                          </Button>
                        </span>
                      )}
                      {markedForDeletion[balance.id] && (
                        <span className="ml-4">
                          <Button
                            isDanger
                            onClick={() => handleDelete(balance.id)}
                          >
                            X?
                          </Button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </main>
  );
}
