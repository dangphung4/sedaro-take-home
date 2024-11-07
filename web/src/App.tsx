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

  // Updated plot configuration with modern styling
  const plotConfig = {
    style: { 
      width: '100%', 
      height: '500px', // Increased height
    },
    layout: {
      template: 'plotly_dark',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Inter, system-ui, sans-serif',
        color: '#94a3b8',
        size: 12
      },
      xaxis: {
        showgrid: true,
        gridwidth: 0.5,
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zeroline: false,
        showline: true,
        linecolor: 'rgba(148, 163, 184, 0.2)',
      },
      yaxis: {
        showgrid: true,
        gridwidth: 0.5,
        gridcolor: 'rgba(148, 163, 184, 0.1)',
        zeroline: false,
        showline: true,
        linecolor: 'rgba(148, 163, 184, 0.2)',
        scaleanchor: 'x',
      },
      margin: { t: 40, r: 20, b: 40, l: 20 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 1.12,
        x: 0.5,
        xanchor: 'center',
        bgcolor: 'rgba(0,0,0,0)',
        font: { size: 12 }
      },
      hovermode: 'closest',
    },
    config: {
      displaylogo: false,
      displayModeBar: true,
      responsive: true,
      scrollZoom: true,
    }
  };

  return (
    <Container style={{ 
      background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: '2rem'
    }}>
      <Flex direction="column" gap="6" py="6">
        {/* Header with gradient text */}
        <Flex justify="between" align="center" mb="8">
          <Heading as="h1" size="8" className="fade-in" style={{ 
            background: 'linear-gradient(to right, #60a5fa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Orbital Simulation
          </Heading>
          <Link to={Routes.FORM} className="fade-in delay-1">
            <Button size="3" style={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              transition: 'all 0.2s',
              ':hover': {
                background: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)'
              }
            }}>
              New Simulation
            </Button>
          </Link>
        </Flex>

        {/* Plots with glass morphism effect */}
        <Flex gap="6" direction={{ initial: 'column', md: 'row' }}>
          <Card className="plot-card fade-in delay-1" style={{ 
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            padding: '1.5rem'
          }}>
            <Text size="2" mb="4" style={{ color: '#94a3b8', fontWeight: 500 }}>Position Plot</Text>
            <Plot
              {...plotConfig}
              data={positionData.map((data, idx) => ({
                ...data,
                name: idx === 0 ? 'Body1' : 'Body2',
                mode: 'lines',
                line: {
                  color: idx === 0 ? '#3b82f6' : '#10b981',
                  width: 2,
                  shape: 'spline',
                },
              }))}
            />
          </Card>

          <Card className="plot-card fade-in delay-2" style={{ 
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            padding: '1.5rem'
          }}>
            <Text size="2" mb="4" style={{ color: '#94a3b8', fontWeight: 500 }}>Velocity Plot</Text>
            <Plot
              {...plotConfig}
              data={velocityData.map((data, idx) => ({
                ...data,
                name: idx === 0 ? 'Body1' : 'Body2',
                mode: 'lines',
                line: { 
                  color: idx === 0 ? '#06b6d4' : '#f43f5e',
                  width: 2,
                  shape: 'spline',
                }
              }))}
            />
          </Card>
        </Flex>

        {/* Initial Conditions Table with modern styling */}
        <Card className="fade-in delay-3" style={{ 
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: '1.5rem'
        }}>
          <Text size="2" mb="4" style={{ color: '#94a3b8', fontWeight: 500 }}>Initial Conditions</Text>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell style={{ color: '#64748b', fontWeight: 600 }}>Agent</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ color: '#64748b', fontWeight: 600 }}>Initial Position (x,y)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ color: '#64748b', fontWeight: 600 }}>Initial Velocity (x,y)</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {Object.entries(initialState).map(([agentId, { x, y, vx, vy }]) => (
                <Table.Row 
                  key={agentId} 
                  className="table-row"
                  style={{ 
                    transition: 'background 0.2s',
                    ':hover': { background: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  <Table.RowHeaderCell>
                    <Text weight="medium" style={{ color: '#e2e8f0' }}>{agentId}</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell style={{ color: '#94a3b8' }}>
                    ({x.toFixed(3)}, {y.toFixed(3)})
                  </Table.Cell>
                  <Table.Cell style={{ color: '#94a3b8' }}>
                    ({vx.toFixed(3)}, {vy.toFixed(3)})
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
