// Variables
const selectCategory = document.querySelector('#selectCategory');
const btnStart = document.querySelector('#inputSubmit');
const inputName = document.querySelector('#inputName');
const selectNumber = document.querySelector('#selectNumber');
const selectDifficulty = document.querySelector('#selectDifficulty');
const selectType = document.querySelector('#selectType');

const gameContainer = document.querySelector('#gameContainer');

const bg = document.querySelector('.bg');

const formObj = {
    name: '',
    number: '',
    category: '',
    difficulty: '',
    type: ''
}

let index = 0;

let correctAnswers = 0;

// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', searchCategories);
    btnStart.addEventListener('click', validateForm)
}



// Funciones
async function searchCategories() {
    const url = 'https://opentdb.com/api_category.php';

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();

        fillSelect(resultado.trivia_categories)
    } catch (error) {
        printAlert('There was an error loading the trivia. The page will refresh automatically.', 'invalid')
    
        setTimeout(() => {
            location.reload();
        }, 3000);
    }

}

function fillSelect(categories) {
    categories.forEach(element => {
        const option = document.createElement('OPTION');
        option.textContent = element.name;
        option.value = element.id;

        selectCategory.appendChild(option);
    });
}

function validateForm(e) {
    e.preventDefault();
    if(inputName.value === '' || selectNumber.value === '' || selectCategory.value === '' || selectDifficulty.value === '' || selectType.value === '') {
        printAlert('All fields are required', 'invalid');
        return;
    }

    formObj['name'] = inputName.value;
    formObj['number'] = selectNumber.value;
    formObj['category'] = selectCategory.value;
    formObj['difficulty'] = selectDifficulty.value;
    formObj['type'] = selectType.value;

    createURL(formObj);
}

function printAlert(message, type) {
    const alerta = document.createElement('P');

    if(type === 'invalid' || type === 'incorrect') {
        alerta.classList.add('alerta');

    } else if (type === 'correct') {
        alerta.classList.add('correct');
    }

    alerta.textContent = message;

    const existe = gameContainer.querySelector('.alerta');
    const existe2 = gameContainer.querySelector('.correct');

    if(existe) {
        existe.remove();
    }

    if(existe2) {
        existe2.remove();
    }

    gameContainer.appendChild(alerta);

    if(type === 'invalid') {
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
    
}

async function createURL(formObj) {
    const { number, category, difficulty, type} = formObj;

    const url = `https://opentdb.com/api.php?amount=${number}&category=${category}&difficulty=${difficulty}&type=${type}`

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();

        printTrivia(resultado.results);
        
    } catch (error) {
        printAlert('There was an error loading the trivia. The page will refresh automatically.', 'invalid')
    
        setTimeout(() => {
            location.reload();
        }, 3000);
    }

}

function printTrivia(resultado) {    
    clearHTML();

    if(resultado.length < formObj.number) {
        const div = document.createElement('DIV');
        div.classList.add('div-disculpa');
        
        const p = document.createElement('P');
        p.innerHTML = `
            Sorry, there are not enough questions with the selected parameters. ☹ <br><br> Please try other parameters.
        `;

        const button = document.createElement('BUTTON');
        button.classList.add('formulario__submit');
        button.textContent = 'Try Again';

        button.onclick = () => {
            window.location.reload()
        }

        div.appendChild(p);
        div.appendChild(button);

        gameContainer.appendChild(div);

        return;
    }

    if(index < resultado.length) {

        const currentQuestion = resultado[index];

        const {question, correct_answer, incorrect_answers} = currentQuestion;

        const questionDIV = document.createElement('DIV');
        
        const questionNumber = document.createElement('P');
        questionNumber.textContent = `${index + 1} / ${resultado.length}`;
    
        const questionText = document.createElement('P');
        const decodedQuestion = decodeEntities(question);
        questionText.textContent = decodedQuestion;
        questionText.classList.add('question-text');
    
        const answersFORM = document.createElement('FORM');
        const answersArray = [...incorrect_answers, correct_answer];
        shuffle(answersArray);
    
        answersArray.forEach(answer => {
    
            answer = decodeEntities(answer);
    
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer'
            input.value = answer;
            input.id = answer;
    
            const label = document.createElement('LABEL');
            label.textContent = answer;
            label.htmlFor = answer;
    
            const respuestaDiv = document.createElement('DIV');
            respuestaDiv.classList.add('campo-trivia')
    
            respuestaDiv.appendChild(input);
            respuestaDiv.appendChild(label);
    
            const questionFieldset = document.createElement('FIELDSET');
            questionFieldset.classList.add('questionFieldset');
            questionFieldset.appendChild(respuestaDiv);
    
            answersFORM.appendChild(questionFieldset);
        });
    
        const button = document.createElement('BUTTON');
        button.classList.add('formulario__submit');
        button.textContent = 'Submit';
        button.onclick = () => {
            const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    
            if(!selectedAnswer) {
                printAlert('Por favor selecciona una respuesta', 'invalid');
                return;
            }
    
            submitAnswer(selectedAnswer.value, correct_answer, resultado);
        }
    
        questionDIV.appendChild(questionNumber);
        questionDIV.appendChild(questionText);
        questionDIV.appendChild(answersFORM);
        questionDIV.appendChild(button);
    
        gameContainer.appendChild(questionDIV);
    } else {

        const div = document.createElement('DIV');
        div.classList.add('div-felicidades')
        const p = document.createElement('P');
        const p2 = document.createElement('P');

        p.innerHTML = `
           Thanks for playing <span>${formObj.name} </span>! 😀
        `;

        p2.innerHTML = `
            You answered <span>${correctAnswers}</span> questions out of <span>${resultado.length}</span> correctly!
        `;

        const button = document.createElement('BUTTON');
        button.classList.add('formulario__submit');
        button.textContent = 'Play Again';

        button.onclick = () => {
            window.location.reload()
        }

        div.appendChild(p);
        div.appendChild(p2);
        div.appendChild(button);

        gameContainer.appendChild(div);
    }

}

function clearHTML() {
    while(gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
    }
}

function shuffle(array) {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const decodeEntities = (function() {
    // this prevents any overhead from creating the object each time
    const element = document.createElement('div');
  
    function decodeHTMLEntities (str) {
      if(str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
      }
  
      return str;
    }
  
    return decodeHTMLEntities;
})();

function submitAnswer(selectedAnswer, correctAnswer, preguntas) {
    const button = document.querySelector('.formulario__submit');
    button.classList.add('button__disabled');
    button.disabled = true;

    const fieldset = document.querySelectorAll('.questionFieldset');
    
    fieldset.forEach(field => {
        field.disabled = true;
    })

    if(selectedAnswer === correctAnswer) {
        printAlert('Correct!', 'correct');
        correctAnswers++;
    } else {
        printAlert('Incorrect!', 'incorrect');
    }

    setTimeout(() => {
        button.textContent = 'Next';
        button.disabled = false;
        button.classList.remove('button__disabled');

        button.onclick = () => {
            index++;
            printTrivia(preguntas)
        }

    }, 2000);

    
}