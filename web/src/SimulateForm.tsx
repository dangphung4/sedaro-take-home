import { Form, FormField, FormLabel } from '@radix-ui/react-form';
import { Button, Card, Container, Flex, Heading, TextField, Slider } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import _ from 'lodash';
import React, { useCallback, useState, useMemo, memo } from 'react';
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

// Memoized form field component
const FormFieldComponent = memo(({ 
  object, 
  field, 
  value, 
  onChange, 
  onSliderChange 
}: { 
  object: string;
  field: string;
  value: FormValue;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (value: number) => void;
}) => (
  <FormField key={`${object}.${field}`} name={`${object}.${field}`}>
    <Flex direction="column" gap="2">
      <FormLabel htmlFor={`${object}.${field}`} style={{ 
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: 500 
      }}>
        {field.toUpperCase()}
      </FormLabel>
      <Flex align="center" gap="3">
        <TextField.Root
          type="number"
          id={`${object}.${field}`}
          name={`${object}.${field}`}
          value={value}
          onChange={onChange}
          required
          style={{
            width: '100px',
            background: 'var(--input-bg)',
            border: 'var(--input-border)',
            borderRadius: '8px',
          }}
        />
        <Slider
          defaultValue={[value as number]}
          max={5}
          min={-5}
          step={0.1}
          onValueChange={(value) => onSliderChange(value[0])}
          style={{ 
            flex: 1,
            '--slider-thumb-size': '16px',
            '--slider-track-height': '4px'
          }}
        />
      </Flex>
    </Flex>
  </FormField>
));

const SimulateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    Planet: { x: 0, y: 0.1, vx: 0.1, vy: 0 },
    Satellite: { x: 0, y: 1, vx: 1, vy: 0 },
  });

  // Debounced form updates
  const debouncedSetFormData = useCallback(
    _.debounce((newData: FormData) => {
      setFormData(newData);
    }, 100),
    []
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue: FormValue = value === '' ? '' : parseFloat(value);
    debouncedSetFormData(prev => _.set({ ...prev }, name, newValue));
  }, [debouncedSetFormData]);

  const handleSliderChange = useCallback((object: string, field: string, value: number) => {
    debouncedSetFormData(prev => ({
      ...prev,
      [object]: { ...prev[object], [field]: value },
    }));
  }, [debouncedSetFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      navigate(Routes.SIMULATION);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [formData, navigate]);

  // Memoize the style objects
  const containerStyle = useMemo(() => ({
    '--text-primary': '#e2e8f0',
    '--text-secondary': '#94a3b8',
    '--input-bg': 'rgba(255,255,255,0.07)',
    '--input-border': '1px solid rgba(255,255,255,0.15)',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  }), []);

  const cardStyle = useMemo(() => ({
    width: '600px',
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    padding: '2.5rem'
  }), []);

  const objectCardStyle = useMemo(() => ({
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  }), []);

  return (
    <Container style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card style={cardStyle}>
          <Flex direction="column" gap="4">
            <Link to={Routes.SIMULATION} style={{ 
              color: '#94a3b8',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              <ArrowLeftIcon /> Back to simulation
            </Link>
            
            <Heading as="h1" size="6" style={{ 
              background: 'linear-gradient(to right, #60a5fa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem',
              fontSize: '2rem',
              fontWeight: 600
            }}>
              New Simulation
            </Heading>

            <Form onSubmit={handleSubmit}>
              {['Planet', 'Satellite'].map((object) => (
                <motion.div 
                  key={object}
                  style={objectCardStyle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: object === 'Planet' ? 0.2 : 0.3 }}
                >
                  <Heading size="4" style={{ 
                    marginBottom: '1.5rem',
                    color: '#e2e8f0'
                  }}>
                    {object} Parameters
                  </Heading>
                  <Flex direction="column" gap="4">
                    {['x', 'y', 'vx', 'vy'].map((field) => (
                      <FormFieldComponent
                        key={`${object}.${field}`}
                        object={object}
                        field={field}
                        value={formData[object][field]}
                        onChange={handleChange}
                        onSliderChange={(value) => handleSliderChange(object, field, value)}
                      />
                    ))}
                  </Flex>
                </motion.div>
              ))}
              
              <Flex justify="center" mt="6">
                <Button size="3" style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  border: 'none',
                  padding: '0 2.5rem',
                  height: '3rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
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

export default memo(SimulateForm);