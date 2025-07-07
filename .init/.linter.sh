#!/bin/bash
cd /home/kavia/workspace/code-generation/recipespin-109342-425141ab/virtual_recipe_roulette_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

