<div align="center">
  <img src="./assets/formularity_logo_small.png" alt="Formularity Logo" width="300"/>
  
  # Formularity
  
  **The last React form library you will ever need!**
  
  [![npm version](https://badge.fury.io/js/formularity.svg)](https://badge.fury.io/js/formularity)
  [![npm downloads](https://img.shields.io/npm/dt/formularity.svg)](https://www.npmjs.com/package/formularity)
  [![GitHub license](https://img.shields.io/github/license/johnsonav1992/formularity.svg)](https://github.com/johnsonav1992/formularity/blob/main/LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![GitHub stars](https://img.shields.io/github/stars/johnsonav1992/formularity.svg?style=social&label=Star)](https://github.com/johnsonav1992/formularity)
  
  [![Build Status](https://img.shields.io/github/actions/workflow/status/johnsonav1992/formularity/ci.yml?branch=main)](https://github.com/johnsonav1992/formularity/actions)
  [![Coverage Status](https://img.shields.io/badge/coverage-90%25-brightgreen)](https://github.com/johnsonav1992/formularity)
  [![Bundle Size](https://img.shields.io/bundlephobia/minzip/formularity)](https://bundlephobia.com/package/formularity)
  
</div>

---

## 🚀 Status

<div align="center">
  <img src="./assets/under-construction.jpg" alt="Under Construction" width="300"/>
  
  **Formularity is currently in active development!**
  
  Stay tuned for continual pre-releases as we get closer to production-ready!
  
  [![Alpha Version](https://img.shields.io/badge/Status-Alpha-orange)](https://www.npmjs.com/package/formularity)
  [![Coming Soon](https://img.shields.io/badge/Coming-Soon-blue)](#coming-soon)
</div>

---

## 🎯 Overview

Formularity is a powerful, type-safe React form library built with TypeScript that provides an intuitive API for building complex forms with minimal boilerplate. It offers comprehensive form state management, validation, and field effects out of the box.

### ✨ Key Features

- 🔥 **Type-Safe**: Full TypeScript support with intelligent type inference
- 🎯 **Zero Dependencies**: Lightweight with no external dependencies
- 🚀 **Performance**: Optimized re-renders and efficient state management
- 🔧 **Flexible**: Works with any UI library or custom components
- 📝 **Validation**: Built-in validators and custom validation support
- 🎨 **Field Effects**: Dynamic field behavior based on form state
- 📱 **Mobile Ready**: Touch-friendly with proper mobile support
- 🧪 **Well Tested**: Comprehensive test coverage

---

## 📦 Installation

```bash
npm install formularity
```

```bash
yarn add formularity
```

```bash
pnpm add formularity
```

---

## 🚀 Quick Start

```tsx
import { Formularity, createFormStore } from 'formularity';

interface FormData {
  email: string;
  password: string;
}

const formStore = createFormStore<FormData>({
  initialValues: {
    email: '',
    password: ''
  }
});

function MyForm() {
  return (
    <Formularity
      formStore={formStore}
      onSubmit={(values) => {
        console.log('Form submitted:', values);
      }}
    >
      {({ Field, SubmitButton, ResetButton }) => (
        <>
          <Field
            name="email"
            type="email"
            placeholder="Enter your email"
          />
          <Field
            name="password"
            type="password"
            placeholder="Enter your password"
          />
          <SubmitButton>Submit</SubmitButton>
          <ResetButton>Reset</ResetButton>
        </>
      )}
    </Formularity>
  );
}
```

---

## 📚 API Reference

### `createFormStore<TFormValues>(options)`

Creates a form store that manages form state. **Required for all Formularity forms.**

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `initialValues` | `TFormValues` | Initial form values |
| `validationSchema` | `ValidationHandler<TFormValues>` | Validation schema (e.g., Zod adapter) |
| `manualValidationHandler` | `ValidationHandler<TFormValues>` | Manual validation function |
| `onSubmit` | `(values: TFormValues) => void \| Promise<void>` | Optional global submit handler |

### `<Formularity>`

The main component for building forms with render props pattern.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `formStore` | `FormStore<TFormValues>` | Form store created with `createFormStore` |
| `onSubmit` | `(values: TFormValues) => void \| Promise<void>` | Form submission handler |
| `onReset` | `(values: TFormValues) => void \| Promise<void>` | Form reset handler |
| `validateOnChange` | `boolean` | Validate on field change (default: `true`) |
| `validateOnBlur` | `boolean` | Validate on field blur (default: `true`) |
| `validateOnSubmit` | `boolean` | Validate on form submission (default: `true`) |
| `componentLibrary` | `ComponentLibraryConfig` | Component library configuration |
| `children` | `(formularity: FormularityProps) => ReactNode` | Render function |

### `<Field>`

Universal field component that works with any input type or custom component.

#### Key Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Field name (supports dot notation for nested fields) |
| `type` | `HTMLInputTypeAttribute` | Input type (default: `'text'`) |
| `component` | `React.Component \| keyof IntrinsicFormElements` | Custom component to render |
| `label` | `string` | Field label |
| `validators` | `SingleFieldValidator[] \| SingleFieldValidator` | Field-level validators |
| `fieldEffects` | `FieldEffectsConfig` | Field effects configuration |
| `showErrors` | `boolean` | Whether to show validation errors |

### `<FieldList>`

Component for rendering dynamic field arrays with helper functions.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Name of the array field |
| `render` | `(values, helpers) => ReactNode` | Render function with array values and helpers |

#### Helper Functions

- `addField(value)` - Add new field to the end
- `removeField(index)` - Remove field at index
- `moveField(from, to)` - Move field to new position
- `replaceField(index, value)` - Replace field value
- `insertField(index, value)` - Insert field at index
- `swapFields(indexA, indexB)` - Swap two fields

### `<SubmitButton>` & `<ResetButton>`

Built-in form action buttons with automatic state management.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `component` | `React.Component` | Custom button component |
| `disableInvalid` | `boolean` | Disable when form is invalid |
| `disabledMode` | `'always' \| 'after-first-submission'` | When to apply disabled state |

### Validation

#### Built-in Validators

```tsx
import { validators } from 'formularity';

const { required, min, pattern, matchField } = validators;

// Field-level validation
<Field
  name="username"
  validators={[required(), min(3)]}
/>

// Password matching
<Field
  name="confirmPassword"
  validators={[required(), matchField('password')]}
/>
```

#### Schema Validation (Zod)

```tsx
import { z } from 'zod';
import { zodAdapter } from 'formularity-zod-adapter';

const validationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

const formStore = createFormStore({
  initialValues: { name: '', email: '' },
  validationSchema: zodAdapter(validationSchema)
});
```

### Field Effects

Dynamic field behavior based on form state changes.

```tsx
<Field
  name="firstName"
  fieldEffects={{
    'email-blur': (email, firstName, { setValue, setError }) => {
      if (email?.includes('@example.com')) {
        setValue('Example User');
        setError(null);
      }
    }
  }}
/>
```

### `useFormularity` Hook

Lower-level hook for accessing form state outside of `<Formularity>` component.

```tsx
const formularity = useFormularity({ formStore });

// Access form state
const { values, errors, touched, isSubmitting } = formularity;
```

---

## 🎨 Examples

### Basic Form
```tsx
// See Quick Start section above
```

### With Built-in Validators
```tsx
import { Formularity, createFormStore, validators } from 'formularity';

const { required, min, pattern, matchField } = validators;

const formStore = createFormStore({
  initialValues: {
    username: '',
    password: '',
    confirmPassword: ''
  }
});

function ValidatedForm() {
  return (
    <Formularity
      formStore={formStore}
      onSubmit={(values) => console.log(values)}
    >
      {({ Field, SubmitButton }) => (
        <>
          <Field
            name="username"
            label="Username"
            validators={[required(), min(3)]}
            showErrors
          />
          <Field
            name="password"
            type="password"
            label="Password"
            validators={[required(), pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)]}
            showErrors
          />
          <Field
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            validators={[required(), matchField('password')]}
            showErrors
          />
          <SubmitButton>Submit</SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```

### With Zod Schema Validation
```tsx
import { z } from 'zod';
import { zodAdapter } from 'formularity-zod-adapter';

const validationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
});

const formStore = createFormStore({
  initialValues: { name: '', email: '', age: '' },
  validationSchema: zodAdapter(validationSchema)
});

function SchemaValidatedForm() {
  return (
    <Formularity formStore={formStore}>
      {({ Field, SubmitButton, errors, touched }) => (
        <>
          <Field name="name" label="Name" showErrors />
          <Field name="email" type="email" label="Email" showErrors />
          <Field name="age" type="number" label="Age" showErrors />
          <SubmitButton>Submit</SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```

### With Custom Components (Material-UI)
```tsx
import { TextField, Button } from '@mui/material';
import { mui } from 'formularity/component-library-configs';

function MaterialUIForm() {
  return (
    <Formularity
      formStore={formStore}
      componentLibrary={mui()}
    >
      {({ Field, SubmitButton, errors, touched }) => (
        <>
          <Field
            name="name"
            component={TextField}
            label="Name"
            size="small"
            helperText={touched.name && errors.name}
            error={!!errors.name && touched.name}
          />
          <SubmitButton
            component={Button}
            variant="contained"
            disableInvalid
          >
            Submit
          </SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```

### Dynamic Field Arrays
```tsx
function DynamicFieldsForm() {
  const formStore = createFormStore({
    initialValues: {
      name: '',
      hobbies: [''],
      contacts: [{ name: '', email: '' }]
    }
  });

  return (
    <Formularity formStore={formStore}>
      {({ Field, FieldList, SubmitButton }) => (
        <>
          <Field name="name" label="Name" />
          
          <FieldList
            name="hobbies"
            render={(hobbies, { addField, removeField }) => (
              <>
                <label>Hobbies</label>
                {hobbies.map((_, idx) => (
                  <div key={idx}>
                    <Field name={`hobbies[${idx}]`} />
                    <button type="button" onClick={() => removeField(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addField('')}>
                  Add Hobby
                </button>
              </>
            )}
          />
          
          <FieldList
            name="contacts"
            render={(contacts, { addField, removeField }) => (
              <>
                <label>Contacts</label>
                {contacts.map((_, idx) => (
                  <div key={idx}>
                    <Field name={`contacts[${idx}].name`} placeholder="Name" />
                    <Field name={`contacts[${idx}].email`} placeholder="Email" />
                    <button type="button" onClick={() => removeField(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField({ name: '', email: '' })}
                >
                  Add Contact
                </button>
              </>
            )}
          />
          
          <SubmitButton>Submit</SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```

### With Field Effects
```tsx
function FieldEffectsForm() {
  return (
    <Formularity formStore={formStore}>
      {({ Field, SubmitButton }) => (
        <>
          <Field name="email" type="email" label="Email" />
          <Field
            name="firstName"
            label="First Name"
            fieldEffects={{
              'email-blur': (email, firstName, { setValue, setError }) => {
                if (email?.includes('@example.com')) {
                  setValue('Example User');
                  setError(null);
                }
              }
            }}
          />
          <SubmitButton>Submit</SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```

---

## 🔧 Advanced Usage

### Accessing Form State Outside Component

```tsx
import { useFormularity } from 'formularity';

function ExternalComponent() {
  const { values, errors, setFieldValue } = useFormularity({ formStore });
  
  return (
    <div>
      <p>Current email: {values.email}</p>
      <button onClick={() => setFieldValue('email', 'preset@example.com')}>
        Set Email
      </button>
    </div>
  );
}
```

### Custom Component Integration

```tsx
function CustomDatePicker({ value, onChange, ...props }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

// Usage
<Field
  name="birthDate"
  component={CustomDatePicker}
  label="Birth Date"
/>
```

### Form Store with Global Submit Handler

```tsx
const formStore = createFormStore({
  initialValues: { name: '', email: '' },
  onSubmit: async (values) => {
    // This will be called if no onSubmit is passed to <Formularity>
    await api.saveUser(values);
  },
  validationSchema: zodAdapter(userSchema)
});
```

### Conditional Field Rendering

```tsx
function ConditionalForm() {
  return (
    <Formularity formStore={formStore}>
      {({ Field, SubmitButton, values }) => (
        <>
          <Field
            name="hasAccount"
            type="checkbox"
            label="I have an account"
          />
          
          {values.hasAccount && (
            <>
              <Field name="username" label="Username" />
              <Field name="password" type="password" label="Password" />
            </>
          )}
          
          {!values.hasAccount && (
            <>
              <Field name="email" type="email" label="Email" />
              <Field name="firstName" label="First Name" />
              <Field name="lastName" label="Last Name" />
            </>
          )}
          
          <SubmitButton>Submit</SubmitButton>
        </>
      )}
    </Formularity>
  );
}
```
---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  
  **[⬆ Back to Top](#formularity)**
  
  Made with ❤️ by Alex Johnson
  
</div>