import { useState } from "react";
import { actions } from "astro:actions";
import Button from "~/components/button";

// Type for Balance with account relation
interface BalanceWithAccount {
  id: string;
  balance: number;
  date: Date;
  accountId: string;
  account: {
    id: string;
    name: string;
  };
}

interface BalancesListProps {
  balances: BalanceWithAccount[];
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

  return (
    <main>
      <a href="/balances/new">
        <Button>+ New Balance</Button>
      </a>

      <table className="mt-5 min-w-full">
        <thead className="border-b border-gray-300 text-left">
          <tr>
            <th className="pr-2">Date</th>
            <th className="pr-2">Account</th>
            <th className="pr-2">Amount</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((balance) => (
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
                    <Button isDanger onClick={markForDeletion(balance.id)}>
                      X
                    </Button>
                  </span>
                )}
                {markedForDeletion[balance.id] && (
                  <span className="ml-4">
                    <Button isDanger onClick={() => handleDelete(balance.id)}>
                      X?
                    </Button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
