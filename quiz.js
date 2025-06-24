// Select DOM elements
const box = document.querySelector('.box');


// API URL for fetching quiz categories
const url = `https://opentdb.com/api_category.php/`;

function renderHomePage() {
  document.body.style.backgroundImage = 'url(./images/quiz-image.png)';

  // Fetch quiz categories from the API

  fetch(url)
    .then((response) => {

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json()
    })
    .then((data) => {
      //Create div for quiz categories
      const quizCategories = document.createElement('div');
      box.appendChild(quizCategories);
      quizCategories.classList.add('quiz-categories');

      // Create and append label for quiz categories
      const categoryLabelElement = document.createElement('label');
      categoryLabelElement.for = 'categories';
      categoryLabelElement.innerHTML = 'Choose a quiz category';


      // Create and append select element for quiz categories
      const categorySelectElement = document.createElement('select');
      categorySelectElement.name = 'categories';
      categorySelectElement.id = 'categories';

      quizCategories.appendChild(categoryLabelElement);
      quizCategories.appendChild(categorySelectElement);

      // Create and append default option for category select element
      const firstOptionElement = document.createElement('option');
      firstOptionElement.value = '';
      firstOptionElement.id = 'default-option';
      firstOptionElement.innerHTML = 'Select a category';
      firstOptionElement.classList.add('option-element');
      categorySelectElement.appendChild(firstOptionElement);

      // Append fetched categories to the select element
      const triviaCategories = data.trivia_categories;


      triviaCategories.forEach((category) => {
        const optionElement = document.createElement('option');

        optionElement.value = category.id;
        optionElement.id = category.id;
        optionElement.innerHTML = category.name;
        optionElement.classList.add('option-element');

        categorySelectElement.appendChild(optionElement);
      })

      let selectedCategoryID = 'default-option';

      // Event listener for category selection
      categorySelectElement.addEventListener('change', (event) => {
        const selectedCategory = event.target.options[event.target.selectedIndex];
        selectedCategoryID = selectedCategory.id;
      })

      //Create div for difficulties
      const difficultyCategories = document.createElement('div');
      box.appendChild(difficultyCategories);
      difficultyCategories.classList.add('difficulties');

      // Create and append label for difficulties
      const difficultyLabelElement = document.createElement('label');
      difficultyLabelElement.for = 'difficulty';
      difficultyLabelElement.innerHTML = 'Choose a difficulty level';

      // Create and append select element for difficulties
      const difficultySelectElement = document.createElement('select');
      difficultySelectElement.name = 'difficulty';
      difficultySelectElement.id = 'difficulty';

      difficultyCategories.appendChild(difficultyLabelElement);
      difficultyCategories.appendChild(difficultySelectElement);


      difficultySelectElement.innerHTML = `
    <option class='option-element' id='default-option'>Select a difficulty level</option>
    <option class='option-element' id='easy'>Easy</option>
    <option class='option-element' id='medium'>Medium</option>
    <option class='option-element' id='hard'>Hard</option>
    `;


      let difficultyValue = 'default-option';

      // Event listener for difficulty selection
      difficultySelectElement.addEventListener('change', (event) => {
        const selectedDifficulty = event.target.options[event.target.selectedIndex];
        difficultyValue = selectedDifficulty.id;
      })

      const nextButton = document.createElement('button');
      nextButton.innerText = 'Next';
      nextButton.classList.add('next-button');
      box.appendChild(nextButton);

      // Event listener for the next button
      nextButton.addEventListener('click', () => {
        if (selectedCategoryID === 'default-option' || difficultyValue === 'default-option') {
          alert('Please Select a Valid Category or Quiz Option');
        }
        else {
          quiz(selectedCategoryID, difficultyValue);
        }
      });

    })
    .catch((error) => {
      box.innerHTML = 'Error loading quiz questions';
    })
}

renderHomePage()


// Function to fetch and display quiz questions
function quiz(selectedCategoryID, difficultyValue) {
  const link = `https://opentdb.com/api.php?amount=5&category=${selectedCategoryID}&difficulty=${difficultyValue}&type=multiple`;

  fetch(link)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status : ${response.status}`)
      }
      return response.json();
    })
    .then((data) => {

      let questionsHTML = '';

      // Create and append form element to the box
      const formElement = document.createElement('form');
      box.appendChild(formElement);
      formElement.classList.add('form');

      const fieldsetElement = document.createElement('fieldset');
      formElement.appendChild(fieldsetElement);


      const questionBank = data.results;

      const allAnswerBanks = [];

      questionsHTML += `
        <h2 class='title'>Answer these questions</h2>
      `;


      // Iterate through each question and generate HTML
      questionBank.forEach((question) => {

        let answerBank = question.incorrect_answers.concat(question.correct_answer);

        answerBank.sort(() => Math.random() - 0.5);

        allAnswerBanks.push(answerBank);

        questionsHTML += `
        <fieldset>
          <legend class='question'>${question.question}</legend><br>
      `;

        answerBank.forEach((answer) => {
          questionsHTML += `
          <input type='radio' name='${question.question}' value='${answer}'>
          <label>${answer}</label><br>
        `;
        });

        questionsHTML += `
        </fieldset>
      `;

      });

      questionsHTML += `
      <button class="submit-button">Submit</button>
      `

      formElement.innerHTML = questionsHTML;
      box.innerHTML = formElement.outerHTML;

      let selectedAnswers = {};

      // Event listener for answer selection
      const answerOptions = document.querySelectorAll('input[type="radio"]');

      answerOptions.forEach(option => {
        option.addEventListener('change', (event) => {

          selectedAnswers[event.target.name] = event.target.value;

        });

      });

      // Event listener for the submit button
      const submitButton = document.querySelector('.submit-button');

      submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        let resultHTML = '';
        let totalScore = 0;

        resultHTML += `
        <h2 class='title'>Your Results:</h2>
      `;

        // Iterate through each question and generate result HTML
        questionBank.forEach((question, index) => {

          //Decode the questions in the question bank from original HTML form to regular string form
          const div = document.createElement('div');
          div.innerHTML = `${question.question}`;
          const decodedQuestion = div.textContent;

          const userAnswer = selectedAnswers[decodedQuestion];

          resultHTML += `
            <fieldset>
          <legend class='question'>${question.question}</legend><br>
      `;


          let count = 0;
          const answerBank = allAnswerBanks[index];

          answerBank.forEach((answer) => {

            if (`${answer}` === `${question.correct_answer}`) {
              resultHTML += `
              <input type='radio' name='${question.question}' value='${answer}' ${userAnswer === answer ? 'checked' : ''} disabled>
              <label>${answer}</label><img src='./images/green-tick.webp' alt='Green Tick' class='green-tick icon'><br>
            `;

              if (userAnswer === answer) {
                count++; // Increment score if the user's answer is correct
              }

            } else {
              resultHTML += `
              <input type='radio' name='${question.question}' value='${answer}' ${userAnswer === answer ? 'checked' : ''} disabled>
              <label>${answer}</label><img src='./images/red-cross.webp' alt='Red Cross' class='red-cross icon'><br>
            `;
            }

          });

          totalScore += count;

          resultHTML += `
          <div class='answer-info'>
          <p>Your answer was: ${userAnswer}</p>
          <p>The correct answer is: ${question.correct_answer}</p>
          </div>
          `;

          resultHTML += `
        </fieldset>
      `;

        });

        resultHTML += `
        <p class='total-score'>Your total score: ${totalScore} out of 5</p>
        `

        resultHTML += `
        <button class="home-button">Home</button>
        `

        // Display the result HTML in the box
        box.innerHTML = resultHTML;

        document.querySelector('.home-button').addEventListener('click', () => {
          box.innerHTML = " ";
          renderHomePage();
        })


        document.body.style.backgroundImage = 'url(./images/right-wrong.webp)';
      });

    })
    .catch((error) => {
      box.innerHTML = 'Error loading quiz questions';
    })
}

