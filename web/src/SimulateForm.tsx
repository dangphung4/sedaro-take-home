import { Form, FormField, FormLabel } from '@radix-ui/react-form';
import { Button, Card, Container, Flex, Heading, TextField, Slider } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import _ from 'lodash';
import React, { useCallback, useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Routes } from 'routes';
import './animations.css';

type FormValue = number | '';
interface FormData {
  Body1: {
    x: FormValue;
    y: FormValue;
    z: FormValue;
    vx: FormValue;
    vy: FormValue;
    vz: FormValue;
    mass: FormValue;
  };
  Body2: {
    x: FormValue;
    y: FormValue;
    z: FormValue;
    vx: FormValue;
    vy: FormValue;
    vz: FormValue;
    mass: FormValue;
  };
}

// Memoized form field component
const FormFieldComponent = memo(({ 
  object, 
  field, 
  value, 
  onChange, 
  onSliderChange,
  className 
}: { 
  object: string;
  field: string;
  value: FormValue;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (value: number) => void;
  className?: string;
}) => (
  <FormField 
    key={`${object}.${field}`} 
    name={`${object}.${field}`}
    className={`form-field hover-effect ${className || ''}`}
    style={{ width: '100%' }}
  >
    <Flex direction="column" gap="2" style={{ width: '100%' }}>
      <FormLabel htmlFor={`${object}.${field}`} className="form-label">
        {field.toUpperCase()}
      </FormLabel>
      <Flex 
        align="center" 
        gap="3" 
        direction={{ initial: 'column', sm: 'row' }}
        style={{ width: '100%' }}
      >
        <TextField.Root
          type="number"
          id={`${object}.${field}`}
          name={`${object}.${field}`}
          value={value}
          onChange={onChange}
          required
          className="form-input"
          style={{ width: '100%' }}
        />
        <Slider
          defaultValue={[value as number]}
          max={5}
          min={-5}
          step={0.1}
          onValueChange={(value) => onSliderChange(value[0])}
          className="form-slider"
          style={{ width: '100%' }}
        />
      </Flex>
    </Flex>
  </FormField>
));

const SimulateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    Body1: { x: -0.73, y: 0, z: 0, vx: 0, vy: -0.0015, vz: 0, mass: 1 },
    Body2: { x: 60.34, y: 0, z: 0, vx: 0, vy: 0.13, vz: 0, mass: 0.0123 },
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

  return (
    <Container className="form-container">
      <Card className="fade-in">
        <Flex direction="column" gap="3">
          <Link to={Routes.SIMULATION} className="back-link fade-in delay-1">
            <ArrowLeftIcon /> Back to simulation
          </Link>
          
          <Heading as="h1" size="6" className="fade-in delay-1">
            New Simulation
          </Heading>

          <Form onSubmit={handleSubmit}>
            <Flex 
              direction={{ initial: 'column', sm: 'row' }} 
              gap="4"
              style={{ width: '100%' }}
            >
              {['Body1', 'Body2'].map((object, index) => (
                <div 
                  key={object}
                  className={`object-card fade-in delay-${index + 2}`}
                  style={{ width: '100%' }}
                >
                  <Heading size="4" className="object-heading">
                    {object} Parameters
                  </Heading>
                  <Flex direction="column" gap="3" style={{ width: '100%' }}>
                    {['x', 'y', 'z', 'vx', 'vy', 'vz', 'mass'].map((field) => (
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
                </div>
              ))}
            </Flex>
            
            <Flex justify="center" mt="4">
              <Button 
                size="3" 
                className="fade-in delay-3"
                style={{ width: '100%', maxWidth: '200px' }}
              >
                Start Simulation
              </Button>
            </Flex>
          </Form>
        </Flex>
      </Card>
    </Container>
  );
};

export default memo(SimulateForm);