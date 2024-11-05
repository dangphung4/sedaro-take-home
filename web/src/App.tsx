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
      borderRadius: '12px',
      background: 'var(--gray-1)',
    },
    layout: {
      template: 'plotly_dark',
      paper_bgcolor: '#1a1a1a',
      plot_bgcolor: '#1a1a1a',
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 12,
        color: '#ffffff'
      },
      yaxis: { 
        scaleanchor: 'x',
        gridcolor: '#333333',
        zerolinecolor: '#333333',
        tickfont: { size: 10, color: '#888888' }
      },
      xaxis: {
        gridcolor: '#333333',
        zerolinecolor: '#333333',
        tickfont: { size: 10, color: '#888888' }
      },
      autosize: true,
      dragmode: 'pan',
      margin: { t: 40, r: 20, b: 40, l: 40 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0)',
        font: { size: 10, color: '#888888' }
      }
    },
    config: {
      scrollZoom: true,
      responsive: true,
      displayModeBar: 'hover',
      displaylogo: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
      toImageButtonOptions: {
        format: 'svg',
        filename: 'orbital_simulation',
        height: 1000,
        width: 1400,
        scale: 1
      }
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
                name: `Agent ${idx + 1}`,
                mode: 'lines+markers',
                marker: { 
                  size: 6,
                  symbol: idx === 0 ? 'circle' : 'diamond',
                  color: idx === 0 ? '#00ffff' : '#ff6b6b'
                },
                line: { 
                  width: 1.5,
                  dash: idx === 0 ? 'solid' : 'dot',
                  color: idx === 0 ? '#00ffff' : '#ff6b6b'
                }
              }))}
              layout={{
                ...plotConfig.layout,
                title: {
                  text: 'Position',
                  font: { size: 16, color: '#ffffff' }
                }
              }}
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
                name: `Agent ${idx + 1}`,
                mode: 'lines+markers',
                marker: { 
                  size: 6,
                  symbol: idx === 0 ? 'circle' : 'diamond',
                  color: idx === 0 ? '#00ffff' : '#ff6b6b'
                },
                line: { 
                  width: 1.5,
                  dash: idx === 0 ? 'solid' : 'dot',
                  color: idx === 0 ? '#00ffff' : '#ff6b6b'
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
