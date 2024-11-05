import { Button, Card, Container, Flex, Heading, Table, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import { Routes } from 'routes';
import './animations.css';

// Input data from the simulation
type AgentData = Record<string, number>;
type DataFrame = Record<string, AgentData>;
type DataPoint = [number, number, DataFrame];

// Output data to the plot
type PlottedAgentData = Record<string, number[]>;
type PlottedFrame = Record<string, PlottedAgentData>;

const App = () => {
  // Store plot data in state.
  const [positionData, setPositionData] = useState<PlottedAgentData[]>([]);
  const [velocityData, setVelocityData] = useState<PlottedAgentData[]>([]);
  const [initialState, setInitialState] = useState<DataFrame>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // fetch plot data when the component mounts
    let canceled = false;

    async function fetchData() {
      console.log('calling fetchdata...');

      try {
        // data should be populated from a POST call to the simulation server
        const response = await fetch('http://localhost:8000/simulation');
        if (canceled) return;
        const data: DataPoint[] = await response.json();
        const updatedPositionData: PlottedFrame = {};
        const updatedVelocityData: PlottedFrame = {};

        setInitialState(data[0][2]);

        data.forEach(([t0, t1, frame]) => {
          for (let [agentId, { x, y, vx, vy }] of Object.entries(frame)) {
            updatedPositionData[agentId] = updatedPositionData[agentId] || { x: [], y: [] };
            updatedPositionData[agentId].x.push(x);
            updatedPositionData[agentId].y.push(y);

            updatedVelocityData[agentId] = updatedVelocityData[agentId] || { x: [], y: [] };
            updatedVelocityData[agentId].x.push(vx);
            updatedVelocityData[agentId].y.push(vy);
          }
        });

        setPositionData(Object.values(updatedPositionData));
        setVelocityData(Object.values(updatedVelocityData));
        console.log('Set plot data!');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();

    return () => {
      canceled = true;
    };
  }, []);

  const plotConfig = {
    style: { 
      width: '100%', 
      height: '450px',
    },
    layout: {
      template: 'plotly_dark',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter',
        color: '#a1a1aa',
        size: 11
      },
      xaxis: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: 'rgba(255,255,255,0.05)',
        zeroline: false,
        showline: false,
      },
      yaxis: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: 'rgba(255,255,255,0.05)',
        zeroline: false,
        showline: false,
        scaleanchor: 'x',
      },
      margin: { t: 32, r: 16, b: 32, l: 16 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
        xanchor: 'left',
        bgcolor: 'transparent',
        font: { size: 11 }
      },
      hovermode: 'closest',
    },
    config: {
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
      scrollZoom: true,
    }
  };

  return (
    <Container size="4" style={{ background: '#121212', minHeight: '100vh' }}>
      <Flex direction="column" gap="5" py="6">
        {/* Header */}
        <Flex justify="between" align="center" mb="6">
          <Heading as="h1" size="8" style={{ color: '#ffffff' }}>
            Orbital Simulation
          </Heading>
          <Link to={Routes.FORM} className="fade-in">
            <Button variant="soft" size="3" style={{ 
              background: '#333333', 
              color: '#ffffff',
              border: '1px solid #444444'
            }}>
              New Simulation
            </Button>
          </Link>
        </Flex>

        {/* Plots */}
        <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
          <Card className="plot-container fade-in" style={{ 
            flex: 1, 
            background: '#1a1a1a',
            border: '1px solid #333333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Plot
              {...plotConfig}
              data={positionData.map((data, idx) => ({
                ...data,
                name: idx === 0 ? 'Planet' : 'Satellite',
                mode: 'lines',
                line: {
                  color: idx === 0 ? '#3b82f6' : '#22c55e',
                  width: 1.5,
                },
                showlegend: true,
              }))}
            />
          </Card>

          <Card className="plot-container fade-in" style={{ 
            flex: 1,
            background: '#1a1a1a',
            border: '1px solid #333333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Plot
              {...plotConfig}
              data={velocityData.map((data, idx) => ({
                ...data,
                name: idx === 0 ? 'Planet' : 'Satellite',
                mode: 'lines',
                marker: { 
                  size: idx === 0 ? 6 : 4,
                  symbol: 'circle',
                  color: idx === 0 ? '#00ffff' : '#ff6b6b'
                },
                line: { 
                  width: idx === 0 ? 1.5 : 1,
                  color: idx === 0 ? '#00ffff' : '#ff6b6b',
                  shape: 'spline',
                  smoothing: 1.3,
                  simplify: true
                }
              }))}
              layout={{
                ...plotConfig.layout,
                title: {
                  text: 'Velocity',
                  font: { size: 16, color: '#ffffff' }
                }
              }}
            />
          </Card>
        </Flex>

        {/* Initial Conditions Table */}
        <Card className="fade-in" style={{ 
          background: '#1a1a1a',
          border: '1px solid #333333',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell style={{ color: '#888888' }}>Agent</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ color: '#888888' }}>Initial Position (x,y)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ color: '#888888' }}>Initial Velocity (x,y)</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {Object.entries(initialState).map(([agentId, { x, y, vx, vy }]) => (
                <Table.Row key={agentId}>
                  <Table.RowHeaderCell>
                    <Text weight="medium" style={{ color: '#ffffff' }}>{agentId}</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell style={{ color: '#888888' }}>
                    ({x.toFixed(2)}, {y.toFixed(2)})
                  </Table.Cell>
                  <Table.Cell style={{ color: '#888888' }}>
                    ({vx.toFixed(2)}, {vy.toFixed(2)})
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Flex>
    </Container>
  );
};

export default App;
