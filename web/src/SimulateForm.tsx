import { Form, FormField, FormLabel } from '@radix-ui/react-form';
import { Button, Card, Flex, Heading, Separator, TextField, Slider } from '@radix-ui/themes'; // Added Slider import
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Routes } from 'routes';

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
    <div
      style={{
        position: 'absolute',
        top: '5%',
        left: 'calc(50% - 200px)',
        borderRadius: '8px', // Rounded corners
        padding: '20px', // Padding for better spacing
      }}
    >
      <Card
        style={{
          width: '400px',
          padding: '20px', // Added padding for card
          borderRadius: '8px', // Rounded corners for card
          overflow: 'hidden', // Remove overflow
        }}
      >
        <Heading as='h2' size='4' weight='bold' mb='4'>
          Run a Simulation
        </Heading>
        <Link to={Routes.SIMULATION}>View previous simulation</Link>
        <Separator size='4' my='5' />
        <Form onSubmit={handleSubmit}>
          {/* Planet Section */}
          <Heading as='h3' size='3' weight='bold'>
            Planet
          </Heading>
          {['x', 'y', 'vx', 'vy'].map((field) => (
            <FormField key={`Planet.${field}`} name={`Planet.${field}`}>
              <FormLabel htmlFor={`Planet.${field}`}>Initial {field.toUpperCase()}</FormLabel>
              <Flex align="center">
                <TextField.Root
                  type='number'
                  id={`Planet.${field}`}
                  name={`Planet.${field}`}
                  value={formData.Planet[field]}
                  onChange={handleChange}
                  required
                  style={{ width: '60px', marginRight: '10px' }} // Adjusted width for text field
                />
                <Slider
                  defaultValue={[formData.Planet[field] as number]}
                  max={1000} // Adjust max value as needed
                  min={-1000} // Adjust min value as needed
                  step={0.1}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      Planet: { ...prev.Planet, [field]: value[0] },
                    }));
                  }}
                  style={{ width: '100%' }} // Full width for slider
                />
              </Flex>
            </FormField>
          ))}
          {/* Satellite Section */}
          <Heading as='h3' size='3' weight='bold' mt='4'>
            Satellite
          </Heading>
          {['x', 'y', 'vx', 'vy'].map((field) => (
            <FormField key={`Satellite.${field}`} name={`Satellite.${field}`}>
              <FormLabel htmlFor={`Satellite.${field}`}>Initial {field.toUpperCase()}</FormLabel>
              <Flex align="center">
                <TextField.Root
                  type='number'
                  id={`Satellite.${field}`}
                  name={`Satellite.${field}`}
                  value={formData.Satellite[field]}
                  onChange={handleChange}
                  required
                  style={{ width: '60px', marginRight: '10px' }} // Adjusted width for text field
                />
                <Slider
                  defaultValue={[formData.Satellite[field] as number]}
                  max={1000} // Adjust max value as needed
                  min={-1000} // Adjust min value as needed
                  step={0.1}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      Satellite: { ...prev.Satellite, [field]: value[0] },
                    }));
                  }}
                  style={{ width: '100%' }} // Full width for slider
                />
              </Flex>
            </FormField>
          ))}
          <Flex justify='center' m='5'>
            <Button type='submit'>Submit</Button>
          </Flex>
        </Form>
      </Card>
    </div>
  );
};

export default SimulateForm;