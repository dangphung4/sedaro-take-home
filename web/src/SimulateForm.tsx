import { Form, FormField, FormLabel } from '@radix-ui/react-form';
import { Button, Card, Container, Flex, Heading, Separator, TextField, Slider, Text } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Routes } from 'routes';
import { motion } from 'framer-motion';

type FormValue = number | '';
interface FormData {
  Planet: {
    x: FormValue;
    y: FormValue;
    vx: FormValue;
    vy: FormValue;
  };
  Satellite: {
    x: FormValue;
    y: FormValue;
    vx: FormValue;
    vy: FormValue;
  };
}

const SimulateForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    Planet: { x: 0, y: 0.1, vx: 0.1, vy: 0 },
    Satellite: { x: 0, y: 1, vx: 1, vy: 0 },
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue: FormValue = value === '' ? '' : parseFloat(value);
    setFormData((prev) => _.set({ ...prev }, name, newValue));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:8000/simulation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        navigate(Routes.SIMULATION);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [formData]
  );

  return (
    <Container style={{ 
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card style={{
          width: '500px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: '2rem'
        }}>
          <Flex direction="column" gap="4">
            <Link to={Routes.SIMULATION} style={{ 
              color: '#94a3b8',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <ArrowLeftIcon /> Back to simulation
            </Link>
            
            <Heading as="h1" size="6" style={{ 
              background: 'linear-gradient(to right, #60a5fa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1.5rem'
            }}>
              New Simulation
            </Heading>

            <Form onSubmit={handleSubmit}>
              {['Planet', 'Satellite'].map((object) => (
                <div key={object} style={{ marginBottom: '2rem' }}>
                  <Heading as="h2" size="3" style={{ 
                    color: '#e2e8f0',
                    marginBottom: '1rem'
                  }}>
                    {object}
                  </Heading>
                  <Flex direction="column" gap="3">
                    {['x', 'y', 'vx', 'vy'].map((field) => (
                      <FormField key={`${object}.${field}`} name={`${object}.${field}`}>
                        <Flex direction="column" gap="2">
                          <FormLabel htmlFor={`${object}.${field}`} style={{ color: '#94a3b8' }}>
                            Initial {field.toUpperCase()}
                          </FormLabel>
                          <Flex align="center" gap="3">
                            <TextField.Root
                              type="number"
                              id={`${object}.${field}`}
                              name={`${object}.${field}`}
                              value={formData[object][field]}
                              onChange={handleChange}
                              required
                              style={{
                                width: '80px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}
                            />
                            <Slider
                              defaultValue={[formData[object][field] as number]}
                              max={5}
                              min={-5}
                              step={0.1}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  [object]: { ...prev[object], [field]: value[0] },
                                }));
                              }}
                              style={{ flex: 1 }}
                            />
                          </Flex>
                        </Flex>
                      </FormField>
                    ))}
                  </Flex>
                </div>
              ))}
              
              <Flex justify="center" mt="6">
                <Button size="3" style={{
                  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                  border: 'none',
                  padding: '0 2rem',
                  height: '2.5rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ':hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }
                }}>
                  Start Simulation
                </Button>
              </Flex>
            </Form>
          </Flex>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SimulateForm;