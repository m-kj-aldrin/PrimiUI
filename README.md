# PrimiUI

The custom elements developed in this project are designed to implement basic UX needs and can be used without any styling. They are easy to extend with base styles according to a base theme.

## Usage

```html
<head>
    <!-- base theme --props -->
    <link rel="stylesheet" href="../src/custom-elements/base.theme.css" />

    <!-- custom element logic -->
    <script type="module" src="../src/custom-elements/Select/index.js"></script>

    <!-- custom element functional/ux styling -->
    <link rel="stylesheet" href="../src/custom-elements/Select/base.ux.css" />

    <!-- optional asethic styling using base.theme.css -->
    <link rel="stylesheet" href="../src/custom-elements/Select/base.style.css" />
</head>

<select-root x-name="favorite-food" x-open>
    <select-trigger>Choose your favorite</select-trigger>
    <select-content>
        <select-item x-value="pizza">🍕 Pizza Margherita</select-item>
        <select-item x-value="sushi">🍣 Fresh Sushi Roll</select-item>
        <select-item x-value="taco">🌮 Street Tacos</select-item>
        <select-item x-value="coffee">☕️ Hot Coffee</select-item>
        <select-item x-value="rocket">🚀 Space Travel</select-item>
        <select-item x-value="unicorn" x-disabled>
            🦄 Magic Unicorn
        </select-item>
    </select-content>
</select-root>
```

## Custom data

This project includes VSCode custom data for HTML and CSS custom elements.

## Built with Cursor

The project contains the .cursor/rules used to build the project, they are geared towards ecma2022+, event delegation and **light dom** custom-elements.
