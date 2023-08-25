import React from "react";
import { ResponsiveLine } from "@nivo/line";
import moment from "moment";
import Typography from "./Typography";
import { space_grotesk } from "@/util/fonts";
import { PriceChange } from "@/util/api";

const currentPriceDataId = "currentPrice";

// @ts-ignore
const DashedSolidLine = ({ series, lineGenerator, xScale, yScale }) => {
    //@ts-ignore
    return series.map(({ id, data }) => (
        <path
            key={id}
            d={lineGenerator(
                //@ts-ignore
                data.map((d) => ({
                    x: xScale(d.data.x),
                    y: yScale(d.data.y),
                }))
            )}
            fill="none"
            stroke={"#040404"}
            style={
                id === currentPriceDataId
                    ? {
                          strokeDasharray: "6, 5",
                          strokeWidth: 3,
                      }
                    : {
                          strokeWidth: 4,
                      }
            }
        />
    ));
};

interface PriceChangeChartProps {
    data: PriceChange[];
    currentPrice: number;
}
export default function PriceChangeChart({ data, currentPrice }: PriceChangeChartProps) {
    function generateGraphData() {
        const sorted = data.sort((a, b) => {
            return moment(a.createdAt).diff(b.createdAt);
        });

        const graphData = [
            {
                id: "priceChanges",
                data: sorted.map((d) => {
                    return {
                        x: d.createdAt,
                        y: d.oldPrice,
                    };
                }),
            },
        ];

        if (sorted.length > 0) {
            const lastPriceChange = sorted[sorted.length - 1];
            graphData.push({
                id: currentPriceDataId,
                data: [
                    {
                        x: lastPriceChange.createdAt,
                        y: lastPriceChange.oldPrice,
                    },
                    {
                        x: new Date().toISOString(),
                        y: currentPrice,
                    },
                ],
                // @ts-ignore
                borderDash: [20, 30],
            });
        }

        return graphData;
    }

    return (
        <div className="w-full h-72">
            <ResponsiveLine
                tooltip={(input) => {
                    const date = input.point.data.xFormatted;
                    let price = input.point.data.yFormatted;
                    if (typeof price === "string") {
                        price = parseFloat(price);
                    }

                    return (
                        <div className="p-2 rounded-lg text-center bg-zinc-50 border border-zinc-300 shadow-sm">
                            <Typography sm>
                                {new Date(date)
                                    .toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    .replaceAll("/", ".")}
                            </Typography>
                            <Typography bold sm>
                                {price.toLocaleString()} €
                            </Typography>
                        </div>
                    );
                }}
                data={generateGraphData()}
                layers={[
                    // includes all default layers
                    "grid",
                    "markers",
                    "axes",
                    "areas",
                    "crosshair",
                    "slices",
                    "points",
                    "mesh",
                    "legends",
                    DashedSolidLine,
                ]}
                margin={{ top: 50, right: 50, bottom: 50, left: 75 }}
                xScale={{ type: "time", format: "%Y-%m-%dT%H:%M:%S.%L%Z" }}
                yScale={{
                    type: "linear",
                    stacked: false,
                    reverse: false,
                }}
                xFormat="time:%Y-%m-%dT%H:%M:%S.%L%Z"
                curve="catmullRom"
                axisBottom={{
                    tickValues: "every 3 month",
                    tickSize: 0,
                    tickPadding: 15,
                    tickRotation: 45,
                    format: (tick) => moment(tick).format("MMMM"),
                }}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 15,
                    tickValues: 4,
                    tickRotation: 45,
                    format: (v) => {
                        if (typeof v === "number") {
                            return v.toLocaleString() + " €";
                        }

                        return v;
                    },
                }}
                colors={["#040404"]}
                lineWidth={5}
                pointSize={16}
                pointColor="#040404"
                pointBorderWidth={3}
                pointBorderColor="rgba(250,250,250)"
                enableCrosshair={true}
                crosshairType="x"
                useMesh={true}
                legends={[]}
                enableGridX={true}
                gridXValues={["first"]} // Only show the first line
                enableGridY={true}
                gridYValues={4}
                theme={{
                    fontFamily: space_grotesk.style.fontFamily,
                    grid: {
                        line: {
                            strokeDasharray: "6 6",
                            stroke: "rgb(190 190 196)",
                        },
                    },
                    axis: {
                        ticks: {
                            text: {
                                fontWeight: 600,
                                fontSize: 11,
                            },
                        },
                    },
                }}
            />
        </div>
    );
}
