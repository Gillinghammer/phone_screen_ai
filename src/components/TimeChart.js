import React from "react";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryStack,
  VictoryLegend,
  VictoryLabel,
} from "victory";

const manualData = [
  { process: "Manual", task: "Reviewing resumes", hours: 20 },
  { process: "Manual", task: "Scheduling screens", hours: 15 },
  { process: "Manual", task: "Having phone calls", hours: 25 },
];

const aiData = [{ process: "AI", task: "Using PhoneScreen.AI", hours: 2 }];

const TimeChart = () => {
  return (
    <div className="flex flex-col w-full">
      <VictoryChart
        domainPadding={200}
        padding={{ top: 80, bottom: 60, left: 50, right: 50 }}
        domain={{ y: [0, 10] }}
      >
        {/* Add the VictoryLabel for title */}
        <VictoryLabel
          text="Time Spent Screening Candidates "
          x={225} // Adjust the x-coordinate to center the title
          y={30} // Adjust the y-coordinate to position the title appropriately
          textAnchor="middle" // Centers the text
          style={{ fontSize: 20 }} // Adjust font styling as needed
        />
        <VictoryLabel
          text="Based on the screening process for 10 open roles"
          x={225}
          y={250} // Position at the bottom of the chart
          textAnchor="middle"
          style={{ fontSize: 14, fontStyle: "italic" }}
        />
        <VictoryAxis tickFormat={() => ""} />
        <VictoryAxis dependentAxis tickFormat={(x) => `${x} hrs`} />
        <VictoryStack colorScale={["#059669", "#0891b2", "#e11d48"]}>
          {manualData.map((data, index) => (
            <VictoryBar
              key={index}
              data={[data]}
              x="task"
              y="hours"
              labels={({ datum }) => (datum.hours ? `${datum.hours} hrs` : "")}
              barWidth={40}
            />
          ))}
        </VictoryStack>
        <VictoryBar
          data={aiData}
          x="task"
          y="hours"
          barWidth={30}
          labels="30 mins"
          style={{ data: { fill: "#4F46E5" } }}
        />
        <VictoryLegend
          x={250}
          y={60}
          centerTitle
          orientation="vertical"
          gutter={0}
          style={{ title: { fontSize: 14 } }}
          data={[
            { name: "Reviewing resumes", symbol: { fill: "#059669" } },
            { name: "Scheduling screens", symbol: { fill: "#0891b2" } },
            { name: "Having phone calls", symbol: { fill: "#e11d48" } },
            { name: "PhoneScreen.AI", symbol: { fill: "#4F46E5" } },
          ]}
        />
      </VictoryChart>
    </div>
  );
};

export default TimeChart;
