<template>
  <div class="spinner" />
</template>

<style>
.spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid;
  border-color: white;
  border-right-color: lightgray;
  animation: spinner 1s infinite linear;
}

@keyframes spinner {
  to {
    transform: rotate(1turn);
  }
}
</style>
