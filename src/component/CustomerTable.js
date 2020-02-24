import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import fetch from "../data/dataSet";
import _ from "underscore";

const calculateResults = dataCenter => {
  // Calculate points per transaction and total
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const pointsPerTransaction = dataCenter.map(transaction => {
    let points = 0;
    let overOneHundred = transaction.amount - 100;

    if (overOneHundred > 0) {
      // Gain 2 points for every dollar spent over $100 in each transaction
      points += overOneHundred * 2;
    }
    if (transaction.amount > 50) {
      // Adds 1 point for every dollar spent over $50 in each transaction
      points += 50;
    }
    const month = new Date(transaction.transactionDate).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let totalPointsByCustomer = [];
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let { custid, name, month, points } = pointsPerTransaction;
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];
    }
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] = points;

    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;
    } else {
      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      };
    }
  });
  let tot = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach(cRow => {
      tot.push(cRow);
    });
  }

  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer: totByCustomer
  };
};

const CustomerTable = () => {
  const [transactionData, setTransactionData] = useState(null);
  const columns = [
    {
      Header: "Customer",
      accessor: "name"
    },
    {
      Header: "Month",
      accessor: "month"
    },
    {
      Header: "Number of Transactions",
      accessor: "numTransactions"
    },
    {
      Header: "Reward Points",
      accessor: "points"
    }
  ];
  const totalsByColumns = [
    {
      Header: "Customer",
      accessor: "name"
    },
    {
      Header: "Points",
      accessor: "points"
    }
  ];

  const getIndividualTransactions = row => {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, tRow => {
      return (
        row.original.custid === tRow.custid &&
        row.original.monthNumber === tRow.month
      );
    });
    return byCustMonth;
  };

  useEffect(() => {
    fetch().then(data => {
      const results = calculateResults(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='container'>
        <div>
          <div>
            <h2>Total of Points Rewarded for Customers Each Month</h2>
          </div>
        </div>
        <div>
          <div>
            <ReactTable
              data={transactionData.summaryByCustomer}
              columns={columns}
              showPagination={false}
              className='-striped -highlight'
              defaultPageSize={8}
              SubComponent={row => {
                return (
                  <div>
                    {getIndividualTransactions(row).map(tran => {
                      return (
                        <div>
                          <div>
                            <div className='col-8'>
                              <strong>Transaction Date:</strong>{" "}
                              {tran.transactionDate} - <strong>$</strong>
                              {tran.amount} - <strong>Points: </strong>
                              {tran.points}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>
      <div className='container'>
        <div>
          <div>
            <h2>Total of Points Rewarded for Each Customer</h2>
          </div>
        </div>
        <div>
          <div>
            <ReactTable
              data={transactionData.totalPointsByCustomer}
              columns={totalsByColumns}
              defaultPageSize={3}
              showPagination={false}
              className='-striped -highlight'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;
