/* TODO:
* Double check data storage 
*/

/* Call Maker getter to get cond variables
 * Takes number and counts for each condition
 * Returns a condition number 
 */

try { 
    var filename = "KM_act_learn_pilot2";
    var condCounts = "1,5;2,5;3,5;4,5";  
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://langcog.stanford.edu/cgi-bin/subject_equalizer/maker_getter.php?conds=" + condCounts + "&filename=" + filename, false );
    xmlHttp.send( null );
    var cond = xmlHttp.responseText; // For actual experimental runs
} catch (e) {
    var cond = 1;
}

console.log("cond is: " + cond);


var order, training_condition;

/* Set up experiment based on condition */

switch (cond) {
    case "1":
        training_condition = "active";
        order = "order1";
        break;
    case "2":
        training_condition = "receptive";
        order = "order1";
        break;
    case "3":
        training_condition = "active";
        order = "order2";
        break;
    case "4":
        training_condition = "receptive";
        order = "order2";
        break;
}


/*Shows slides. We're using jQuery here the $ is the jQuery selector function, 
which takes as input either a DOM element or a CSS selector string. */
function showSlide(id) {

  $(".slide").hide();  //Hide all slides
  $("#"+id).show(); //Show just the slide we want to show
}

/*Get random integers. When called with no arguments, it returns either 0 or 1. 
When called with one argument, a, it returns a number in [0,a-1]. 
When called with two arguments, a and b, returns a random value in [a,b]. */

function random(a,b) {
  if (typeof b == "undefined") {
    a = a || 2;
    return Math.floor(Math.random()*a);
  } else {
    return Math.floor(Math.random()*(b-a+1)) + a;
  }
}

// returns selected elements and creates a new array with those elements (called 'foo')

function range(start, end)
{
    var foo = [];
    for (var i = start; i <= end; i++)
        foo.push(i);
    return foo;
}

/**
*  from
*  http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
* Randomize array element order in-place.
* Using Fisher-Yates shuffle algorithm.
*/
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function shuffleObjectArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/*Randomly return an element from an array. Useful for condition randomization.*/
Array.prototype.random = function() {
  return this[random(this.length)];
};

/* loads all of the images into the cache so they don't need to be individually
 * loaded at time of presentation. Ensures that experiment time happens as intended
 */
$.fn.preload = function() {
  this.each(function(){
        $('<img/>')[0].src = this;
    });
};

/* gets the linear scale factor 
* inputs: mins and maxes for parameter and stimulus scales
* returns: linear scale factor = ratio of the length of scales
*/

scaleFactor = function(min_param, max_param, min_stim, max_stim) {
    range_param = max_param - min_param;
    range_stim = max_stim - min_stim;
    scale_factor = range_param / range_stim;
    return scale_factor;
};

/* convert array of parameter values to stimulus values 
* inputs: parameter value, scaling factor, and min value of stimulus scale
* returns: array of values on stimulus scale
*/

convertParamStim = function(param_array, scale_factor, min_stim_scale) {
    var stim_array = [];

    for(i=0; i < param_array.length; i++) {
      stim_value = Math.floor((param_array[i] / scale_factor) + min_stim_scale)
      stim_array.push(stim_value);
    }

    return stim_array;
};

/* convert stimulus values to parameter values 
* inputs: stimulus value, scaling factor, and min value of stimulus and param scale
* returns: value on parameter scale
*/

convertStimParam = function(stim_value, scale_factor, min_stim_scale, min_param_scale) {
    param_value = Math.floor(((stim_value - min_stim_scale) * scale_factor) + min_param_scale)
    return param_value
};


/* strips off the directory and suffix of image/sound/etc file names */
trim = function(item) {
  var tmp = item;
  return tmp.slice(tmp.lastIndexOf("/")+1,tmp.lastIndexOf(".")); 
};

// Variable assignment for use later in experiment

/*Create raphael canvas and elements*/
var paper_width = 520;
var paper_height = 520;
var max_radius = (paper_width / 2) - 5;
var min_radius = 15;
var radius_range = max_radius - min_radius;
var third_radius_scale = radius_range / 3;
var min_orientation = 0;
var max_orientation = 150;
var orientation_range = max_orientation - min_orientation;
var third_orientation_scale = orientation_range / 3;

/* Experiment logic */
var num_correct_in_block = 0;
var num_blocks = 6;
var num_trials_block = 48;
var num_trials = num_trials_block * num_blocks;
var num_training_trials_block = 16;
var num_training_trials_experiment = num_training_trials_block * num_blocks
var num_test_trials_block = 32;

/* parameter values for training trials: 
* generated from gaussians (done in R) 
*/

// Order 1: optimal decision boundary = 300 converted to radius scale
var catA1radii_param = [250,188,194,230,161,139,239,184,265,212,187,256,269,215,182,162,230,250,262,203,217,272,193,156,189,238,254,197,230,259,205,158,208,168,172,290,202,297,174,260,190,191,199,231,174,229,230,269];
var catA1orientations_param = [344,281,306,242,353,396,369,197,242,328,377,375,362,290,384,330,480,422,314,245,207,167,209,282,322,294,408,255,203,21,344,401,230,246,318,385,266,243,230,236,416,298,239,163,229,391,446,79];
var catB1radii_param = [360,444,319,405,369,413,385,433,402,362,296,381,281,354,340,442,356,464,433,344,409,395,373,305,339,411,364,387,320,424,350,338,406,402,373,412,388,408,401,416,420,360,418,398,315,368,325,330];
var catB1orientations_param = [308,113,21,359,445,380,392,223,267,326,412,312,431,390,266,207,168,357,148,299,304,286,187,371,441,281,376,355,404,228,342,337,209,272,450,332,269,414,496,311,208,160,187,354,379,481,466,244];

// Order 2: optimal decision boundary = 300 converted to orientation scale
var catA2radii_param = [278,374,298,383,270,419,38,408,337,278,466,415,461,280,250,285,217,220,376,200,294,347,264,447,281,337,207,102,407,373,292,467,280,311,367,285,174,424,273,271,300,219,275,295,285,297,265,353];
var catA2orientations_param = [203,206,219,220,170,202,226,179,255,282,234,246,207,206,282,158,260,270,218,263,258,176,227,222,312,149,201,260,245,190,228,140,174,156,212,298,179,190,319,257,239,153,219,182,207,186,292,217];
var catB2radii_param = [261,462,227,237,200,464,141,230,223,295,390,353,273,288,374,420,403,194,382,349,301,263,279,348,206,341,178,340,367,228,393,352,283,215,191,479,267,377,397,260,255,421,313,253,450,364,371,280];
var catB2orientations_param = [391,434,412,362,351,369,392,368,450,397,411,487,427,371,436,399,347,375,339,332,390,414,373,388,343,457,452,395,397,402,398,370,351,397,390,447,354,415,370,313,328,387,361,402,329,421,391,369];


/* parameter values for test trials:
* generated from uniform grid (done in R)
* sampled 8 from each quadrant of parameter space
* w/o replacement
*/
var test_radii_param = [85,408,286,309,163,374,149,446,128,481,149,415,225,346,207,590,183,564,208,322,39,534,183,541,99,355,130,517,294,367,68,370,132,591,146,320,222,453,178,566,182,468,63,438,269,435,208,578,285,595,246,307,137,375,269,502,223,416,251,570,4,484,208,435,264,519,53,467,103,331,282,477,22,421,223,587,138,329,81,497,24,420,263,356,152,518,146,490,36,541,120,572,5,455,242,364,219,575,126,376,269,430,96,401,146,535,81,378,95,584,61,469,263,413,65,563,47,514,258,326,26,560,253,509,300,317,127,520,109,505,268,552,36,481,201,403,85,342,16,338,72,313,51,360,272,513,146,353,80,343,224,382,88,356,284,446,170,301,253,379,63,554,173,546,49,447,93,590,126,552,12,365,76,365,233,461,116,469,51,331,51,473,144,582,138,575,231,399,73,427,191,374];
var test_orientations_param = [555,438,300,286,342,588,217,143,317,376,263,267,481,484,298,110,513,428,158,252,419,355,223,23,362,412,76,260,433,495,148,251,403,568,217,220,398,377,250,133,449,416,72,76,434,443,221,225,588,379,175,188,404,352,43,9,493,485,66,22,566,479,1,17,365,535,9,182,467,558,96,164,319,533,163,125,454,316,213,243,490,563,219,9,392,422,24,72,416,467,259,24,324,395,232,249,376,577,123,67,330,341,26,184,376,552,248,85,437,578,114,132,499,415,241,8,350,520,17,24,597,332,103,186,540,486,98,89,490,346,59,204,452,568,178,73,356,550,293,170,532,352,176,38,592,320,133,89,338,438,226,74,517,536,186,8,513,317,149,100,538,390,60,296,528,426,55,57,306,401,66,28,581,352,255,259,442,494,254,174,571,438,294,155,349,367,147,194,573,443,291,13];

// set min and max for parameter scale
var min_param_scale = 1;
var max_param_scale = 600;

// set min and max for stimulus scales: radius and orienation
var radius_lower_limit = random(min_radius,third_radius_scale);                // randomize minimum radius value
var radius_upper_limit = max_radius;                                           // max radius is constrained by the bounding box
var rotation_lower_limit = random(min_orientation, third_orientation_scale);   // randomize min orientation value
var rotation_upper_limit = rotation_lower_limit + 150;                         // max orientation is min value + 150

// get scaling factor to convert between scales
var scale_factor_radius = scaleFactor(min_param_scale, max_param_scale, radius_lower_limit, radius_upper_limit);
var scale_factor_orienation = scaleFactor(min_param_scale, max_param_scale, rotation_lower_limit, rotation_upper_limit);

console.log("radius scale is: " + radius_lower_limit + ", " + radius_upper_limit);
console.log("radius scale factor is: " + scale_factor_radius);
console.log("orientation scale is: " + rotation_lower_limit + ", " + rotation_upper_limit);
console.log("orientaiton scale factor is: " + scale_factor_orienation);

// convert training trials parameter space values to stimulus space values 
var catA1radii_stim = shuffle(convertParamStim(catA1radii_param, scale_factor_radius, radius_lower_limit));
var catA1orientations_stim = shuffle(convertParamStim(catA1orientations_param, scale_factor_orienation, rotation_lower_limit));
var catB1radii_stim = shuffle(convertParamStim(catB1radii_param, scale_factor_radius, radius_lower_limit));
var catB1orientations_stim = shuffle(convertParamStim(catB1orientations_param, scale_factor_orienation, rotation_lower_limit));

// convert test trials parameter space values to stimulus space values
var test_radii_stim = convertParamStim(test_radii_param, scale_factor_radius, radius_lower_limit);
var test_orientations_stim = convertParamStim(test_orientations_param, scale_factor_orienation, rotation_lower_limit);

// wrap in array of json objects for each antenna
var order1_antennas = [], order2_antennas = [], test_antennas = [], antenna_a, antenna_b;

// create array of training stimuli for Order 1 
// if in the active training, then randomly generate starting radius/orientation values
for(i = 0; i < num_blocks; i++) {
    var antennas_block = [];
    for(j = 0; j < num_training_trials_block / 2; j++) {
      if(training_condition == "active") {
          antenna_a = {
              radius: random(radius_lower_limit, radius_upper_limit),
              angle: random(rotation_lower_limit, rotation_upper_limit),
              category: "NA",
              block: i + 1
          };

          antenna_b = {
              radius: random(radius_lower_limit, radius_upper_limit),
              angle: random(rotation_lower_limit, rotation_upper_limit),
              category: "NA",
              block: i + 1
          };
      } else {
          antenna_a = {
              radius: catA1radii_stim.shift(),
              angle: catA1orientations_stim.shift(),
              category: "A",
              block: i + 1
          };

          antenna_b = {
            radius: catB1radii_stim.shift(),
            angle: catB1orientations_stim.shift(),
            category: "B",
            block: i + 1
          };
      }
        antennas_block.push(antenna_a);
        antennas_block.push(antenna_b);
    }
    //shuffle block and push into training trials array
    order1_antennas.push(shuffle(antennas_block));  
}

// now do the same thing for Order 2
var catA2radii_stim = shuffle(convertParamStim(catA2radii_param, scale_factor_radius, radius_lower_limit));
var catA2orientations_stim = shuffle(convertParamStim(catA2orientations_param, scale_factor_orienation, rotation_lower_limit));
var catB2radii_stim = shuffle(convertParamStim(catB2radii_param, scale_factor_radius, radius_lower_limit));
var catB2orientations_stim = shuffle(convertParamStim(catB2orientations_param, scale_factor_orienation, rotation_lower_limit));

// create array of training stimuli for Order 2 (48 antenna from each category)
for(i = 0; i < num_blocks; i++) {
    var antennas_block = [];
    for(j = 0; j < num_training_trials_block / 2; j++) {
      if(training_condition == "active") {
          antenna_a = {
              radius: random(radius_lower_limit, radius_upper_limit),
              angle: random(rotation_lower_limit, rotation_upper_limit),
              category: "NA",
              block: i + 1
          };

          antenna_b = {
              radius: random(radius_lower_limit, radius_upper_limit),
              angle: random(rotation_lower_limit, rotation_upper_limit),
              category: "NA",
              block: i + 1
          };
      } else {
          antenna_a = {
              radius: catA2radii_stim.shift(),
              angle: catA2orientations_stim.shift(),
              category: "A",
              block: i + 1
          };

          antenna_b = {
            radius: catB2radii_stim.shift(),
            angle: catB2orientations_stim.shift(),
            category: "B",
            block: i + 1
          };
      }
        antennas_block.push(antenna_a);
        antennas_block.push(antenna_b);
    }
    //shuffle block and push into training trials array
    order2_antennas.push(shuffle(antennas_block));  
}

// create array of test antennas
var num_test_trials = 192, test_antenna_stim, test_antennas_stim = [];


for(i = 0; i < num_blocks; i++) {
  var test_antennas_block = [];
  for(j = 0; j < num_test_trials_block; j++) {
    // get antenna values
    test_antenna_stim = {
      radius: test_radii_stim.shift(),
      angle: test_orientations_stim.shift(),
    }
    // push into block array
    test_antennas_block.push(test_antenna_stim);
  }
  test_antennas_stim.push(test_antennas_block);
}

console.log(test_antennas_stim);

//draw raphael canvas
var paper = Raphael("antenna", paper_width, paper_height);

//get center points of paper
var centerX = paper_width / 2;
var centerY = paper_height / 2;

console.log("order is: " + order);

/* get optimal decision boundary */
var optimal_decision_boundary_param = [300];

// this checks whether the optimal decision boundary is on the radius or orientation scale
if(order == "order1") {
  var optimal_decision_boundary_type = "radius_scale";
  var optimal_decision_boundary_stim = convertParamStim(optimal_decision_boundary_param, scale_factor_radius, radius_lower_limit)
} else {
  var optimal_decision_boundary_type = "orientation_scale";
  var optimal_decision_boundary_stim = convertParamStim(optimal_decision_boundary_param, scale_factor_orienation, rotation_lower_limit)
}

console.log("optional decision boundary stim is: " + optimal_decision_boundary_stim);


/* build trials array */
var trials = [], trial_radius, trial_angle, 
trial_info, trial_type, trial_number = 0, 
trial_category, test_trial;

for(i = 0; i < num_blocks; i++) {

    for(j = 0; j < num_trials_block; j++) {
        // first check what kind of trial: training or test
        if(j < num_training_trials_block) {
          trial_type = "training";
        } else {
          trial_type = "test";
        }

        // if a training trial, grab radius and angle values from appropriate arrays
        if(trial_type == "training") {
          // order determines whether category is defined by radius or orienatation
          if(order == "order1") {
            training_trial = order1_antennas[i].shift(); // using i to index into antennas array
            trial_radius = training_trial.radius;
            trial_angle = training_trial.angle;
            trial_category = training_trial.category;
          } else { 
            training_trial = order2_antennas[i].shift();
            trial_radius = training_trial.radius;
            trial_angle = training_trial.angle;
            trial_category = training_trial.category;
          }
          trial_number++; 
        } else { // get test trials
            test_trial = test_antennas_stim[i].shift()
            trial_radius = test_trial.radius;
            trial_angle =  test_trial.angle;
            // figure out which category test antenna is from 
            // order 1 you check radius 
            // order 2 you check orientation
            if(order == "order1") {
              if(trial_radius < optimal_decision_boundary_stim) {
                trial_category = "A";
              } else {
                trial_category = "B";
              }
            } else {
              if(trial_angle < optimal_decision_boundary_stim) {
                trial_category = "A";
              } else {
                trial_category = "B";
              }
            }
          trial_number++; 
        }

        trial_info = {
          trial_number_experiment: trial_number,
          trial_number_block: j+1,
          block: i+1,
          trial_type: trial_type,
          antenna_category: trial_category,
          radius: trial_radius,
          angle: trial_angle
        }

        trials.push(trial_info);
    }

}


console.log(trials);

//initialize progress bar 
$(".progress").progressbar();
$(".progress").progressbar( "option", "max", num_trials);


// restricts hits to chrome 
if (BrowserDetect.browser != 'Chrome') {
    alert ("Warning: this HIT will not work with your browser. Please use Google Chrome");
    $("#start_button").attr("disabled", "disabled");
}

//Show instruction slide
showSlide("instructions"); 

//disable accept button if in turk preview mode
$("#start_button").click(function() {
    if (turk.previewMode) {
      alert("Please accept HIT to view");
      showSlide("instructions");
    } else {
      if(training_condition == "active") {
        $("#instructions_text_active").attr("style", "display: block");
        $("#instructions_text_receptive").attr("style", "display: none")
        showSlide("instructions2");
      } else {
        $("#instructions_text_active").attr("style", "display: none");
        $("#instructions_text_receptive").attr("style", "display: block")
        showSlide("instructions2");
      }
    }
});


// This is where we define the experiment variable, 
// which tracks all the information we want to know about the experiment.

var experiment = {
  condition: training_condition,
  order: order,
  data: [],
  subj_data: "",
  odb_scale: optimal_decision_boundary_type,
  odb_param: optimal_decision_boundary_param,
  odb_stim: optimal_decision_boundary_stim,
  num_trials: num_trials,
  num_blocks: num_blocks,
  browser: "",
  screen_width: $( window ).width(),
  screen_height: $( window ).height(),

  /*The function that gets called when the sequence is finished. */
  end: function() {
    // store values from q and a 
    experiment.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
      };

    console.log(experiment.subj_data);
    console.log(experiment.data);

    // show finished slide
    showSlide("finished"); 
    // Submit to turk
    setTimeout(function() {   
      var xmlHttp = null;
      xmlHttp = new XMLHttpRequest()
      xmlHttp.open("GET", 
        "https://langcog.stanford.edu/cgi-bin/subject_equalizer/decrementer.php?filename=" + filename + "&to_decrement=" + cond, 
        false);
      xmlHttp.send(null)
      turk.submit(experiment)
        }, 1500);
    },

  /*shows a blank screen*/
  blank: function() {
    // update progress bar
    $(".progress").progressbar("option", "value", ($(".progress").progressbar( "option", "value")+1));
    // hide category label
    $(".category_label").attr("style", "visibility: hidden") 
    // clear borders
    $("#channel_1").css("border", "3px solid white")
    $("#channel_2").css("border", "3px solid white")
    // reset slider
    $( "#single_slider" ).slider({
        range : "min",
        min : 0,
        max : 1,
        step: 0.01,
        value : 0.5,
        change: function( event, ui ) {}
    });
    var slider_check = false;

    //show blank slide
    showSlide("blankSlide");
    // next trial
    setTimeout(experiment.next, 500);  
  },

  summarySlide: function(num_correct_in_block) {
    var prop_correct = num_correct_in_block / num_test_trials_block;
    prop_correct = prop_correct * 100;
    $("#block_acc").text(prop_correct + "%");
    showSlide("summarySlide");
  },

/*The work horse of the sequence: what to do on every trial.*/
  next: function() {
        //disable default spacebar functionality 
        $(document).keydown(function(event) {
            if(event.which == 32){
                return false;
            }
        });
        /*some slider functionality stuff*/
        $(function() {
            $( "#single_slider" ).slider({
              range : "min",
              min : 0,
              max : 1,
              step: 0.01,
              value : 0.5,
              change: function( event, ui ) {}
            });
        }); 

        var slider_check = false;

        $( "#single_slider" ).on( "slidechange", function( event, ui ) {
          slider_check = true;
        });

        // put blue box around svg element
        var rect = paper.rect(0,0,paper_width, paper_height);
        rect.attr({
          stroke: "blue", 
          'stroke-width': 4
        });
        // start clock for RT
        var startTime = (new Date()).getTime(), trial_type, trial;
        // create null variable for tracking x coordinate for rotating object
        var prevDx = null;
        // show progress bar
        $(".progress").attr("style", "visibility: visible")

        // get trial information from trial array
        trial = trials.shift();

        // if trial is undefined, we are done - go to q and a slide
        if (typeof trial == "undefined") {
            $(".progress").attr("style", "visibility: hidden")
            // unbind keyboard event
            $(document).unbind("keydown")
            return showSlide("qanda");
        }
        console.log("Trial info is: ")
        console.log(trial);
        console.log("---------------------")

        // if between blocks we need to display cumulative accuracy during the block they just completed, 
        // as well as their accuracy during the preceding test block

        // set up slide depending on trial type
        if (trial.trial_type == "training" &  // this should be training
          training_condition == "active") {
                $("#task_instructions").attr("style", "display: block");
                $("#channel_label").attr("style", "display: block");
                $("#channel_label").css("border", "3px solid white")
                $("#receptive_instructions").attr("style", "display: none");
                $("#category_table").attr("style", "display: none");
                $("#slider_table").attr("style", "display: none");
                $("#test_instructions").attr("style", "display: none");
                $("#slider_instructions").attr("style", "display: none");
                $("#slider_instructions2").attr("style", "display: none");
        } else if (trial.trial_type == "training" & // this should be "training"
          training_condition == "receptive") {
                $("#task_instructions").attr("style", "display: none");
                $("#channel_label").attr("style", "display: block");
                $("#channel_label").css("border", "3px solid white")
                $("#receptive_instructions").attr("style", "display: block");
                $("#category_table").attr("style", "display: none");
                $("#slider_table").attr("style", "display: none");
                $("#test_instructions").attr("style", "display: none");
                $("#slider_instructions").attr("style", "display: none");
                $("#slider_instructions2").attr("style", "display: none");
        } else {
                $("#task_instructions").attr("style", "display: none");
                $("#channel_label").attr("style", "display: none");
                $("#channel_label").css("border", "3px solid white")
                $("#receptive_instructions").attr("style", "display: none");
                $("#slider_table").attr("style", "display: none");
                $("#slider_instructions").attr("style", "display: none");
                $("#slider_instructions2").attr("style", "display: none");
                $("#test_instructions").attr("style", "display: block");
                $("#category_table").attr("style", "display: block");
        };

        if (trial.trial_type == "training" &
          training_condition == "receptive") {
             var circle = paper.circle(centerX,centerY,trial.radius).attr({
                        fill: "white", 
                        stroke: "rgb(0,0,0)",
                        "stroke-width": 5,
                      });

              var linePath = [ ['M', centerX - trial.radius, centerX], ['L', centerX + trial.radius, centerX] ];
              var line = paper.path( linePath ).attr({
                            stroke: "rgb(0,0,0)",
                            "stroke-width": 5,
                          });

              line.animate({transform: line.attr("transform") + "r" + trial.angle});  

            setTimeout(function() {
                // check which category the antenna is in
                  if (trial.antenna_category == "A") {
                      $("#category").text("1");
                      $(".category_label").attr("style", "visibility: visible"); 
                      category_response = "1";
                  } else {
                      $("#category").text("2");
                      $(".category_label").attr("style", "visibility: visible"); 
                      category_response = "2";
                  } 
            }, 750);

        } else {
          var circle = paper.circle(centerX,centerY,trial.radius).attr({
                        fill: "white", 
                        stroke: "rgb(0,0,0)",
                        "stroke-width": 5,
                      });

              var linePath = [ ['M', centerX - trial.radius, centerX], ['L', centerX + trial.radius, centerX] ];
              var line = paper.path( linePath ).attr({
                            stroke: "rgb(0,0,0)",
                            "stroke-width": 5,
                          });

              line.animate({transform: line.attr("transform") + "r" + trial.angle}); 
        }

        // make drag functions so antenna is interactive
        var start = function (x, y) {
          this.r = this.attr("r");
          this.cx = this.attr("cx");
          },

        scaleAntenna = function(dx, dy) {
                var R = this.r + dx;
                // constrain scaling to the canvas
                if (R <= radius_lower_limit) {
                    R = radius_lower_limit;
                    dx = radius_lower_limit;
                } else if (R >= radius_upper_limit) {
                    R = radius_upper_limit;
                    dx = radius_upper_limit;
                } else {
                    R = R;
                }
                // get x coordinates for line
                var X1 = this.cx - R;
                var X2 = this.cx + R;
                // animate circle
                circle.attr({r: R});
                // animate line
                linePath[0][1] = X1;
                linePath[1][1] = X2;
                line.attr({path: linePath});
        },

        rotateAntenna = function(dx) {
            var angleDiff = dx - prevDx,
            rot_angle = Math.round(line.matrix.split().rotate)

            // scale degree values between 210 and 270 degrees to make the negative
            // this helps with contraining the image rotation
            if(rot_angle >= 209 & rot_angle <= 270) {
              rot_angle = rot_angle - 360; 
            }

            //Constrain rotation
              if(angleDiff + rot_angle > 150 || angleDiff + rot_angle < -150) {
                      angleDiff = 0;
              }

            line.animate({transform: line.attr("transform") + "R" + angleDiff})
            prevDx = dx;
        },

        up = function () {
             this.dx = this.dy = 0;
             prevDx = null;
        },

        logDataTraining = function(category_response, radius_response, orientation_response) {
              $(document).unbind("keydown")

                  // store information from the trial
                  var endTime = (new Date()).getTime();

                  // check which training condition, if in active log interaction data
                  if(training_condition == "active") {
                    radius_response = radius_response;
                    radius_change = Math.abs(trial.radius - radius_response);
                    orientation_response = orientation_response;
                    orientation_change = Math.abs(trial.angle - orientation_response);
                  } else {
                    radius_response = "NA";
                    radius_change = "NA";
                    orientation_response = "NA";
                    orientation_change = "NA";
                    category_response = "NA";
                    trial_category = trial.antenna_category;
                  }

                  console.log("radius response is: " + radius_response);
                  console.log("orientation response is: " + orientation_response);

                  data = {
                    trial_number: trial.trial_number_experiment,
                    trial_type: trial.trial_type,
                    block: trial.block,
                    within_block_trial_number: trial.trial_number_block,
                    radius_trial: trial.radius,
                    radius_response: radius_response,
                    radius_change: radius_change,
                    orientation_response: orientation_response,
                    orientation_trial: trial.angle,
                    orientation_change: orientation_change,
                    category_response: category_response,
                    rt: endTime - startTime,
                    trial_category: trial_category,
                    test_response: "NA",
                    correct: "NA",
                    confidence: "NA"
                  };

                  console.log("Data is: ")
                  console.log(data);
                  console.log("---------------------")

                  experiment.data.push(data);

                  // move on to the next trial
                  setTimeout(function() {
                    paper.clear();
                    setTimeout(experiment.blank,1);
                  }, 500);
        },


        logDataTest = function(test_response) {
                  //unbind event handlers
                  $("#channel_1").unbind();
                  $("#channel_2").unbind();
                  $(document).unbind("keydown")

                  // store information from the trial
                  var confidence = $('#single_slider').slider("option", "value");
                  var endTime = (new Date()).getTime();

                  data = {
                    trial_number: trial.trial_number_experiment,
                    trial_type: trial.trial_type,
                    block: trial.block,
                    within_block_trial_number: trial.trial_number_block,
                    radius_trial: "NA",
                    radius_response: "NA",
                    radius_change: "NA",
                    orientation_response: "NA",
                    orientation_trial: "NA",
                    orientation_change: "NA",
                    rt: endTime - startTime,
                    trial_category: trial.antenna_category,
                    test_response: test_response,
                    correct: test_response == trial.antenna_category,
                    confidence: confidence
                  };

                  console.log("Data is: ")
                  console.log(data);
                  console.log("---------------------")

                  //reset correct counter on the first trial of the test block
                  if(trial.trial_number_experiment == 65 || trial.trial_number_experiment == 113 ||
                    trial.trial_number_experiment == 161 || trial.trial_number_experiment == 209 ||
                    trial.trial_number_experiment == 257) {
                    num_correct_in_block = 0;
                  }
                  // track number of correct in the block 
                  if(test_response == trial.antenna_category) {
                    num_correct_in_block++;
                  };

                  console.log(test_response == trial.antenna_category);
                  console.log(num_correct_in_block);

                  experiment.data.push(data);

                  // move on to the next trial, show summary slide if on the last trial of test block
                  if(trial.trial_number_experiment == 48 || trial.trial_number_experiment == 96 ||
                    trial.trial_number_experiment == 144 || trial.trial_number_experiment == 192 ||
                    trial.trial_number_experiment == 240 || trial.trial_number_experiment == 288) { 
                    setTimeout(function() {
                    paper.clear();
                    setTimeout(experiment.summarySlide(num_correct_in_block), 1);
                  }, 500);
                  } else {
                    setTimeout(function() {
                    paper.clear();
                    setTimeout(experiment.blank, 1);
                  }, 500);

                  }
        };

/* SET UP USER INTERACTIVITY */

    if(trial.trial_type == "training" & // this should be "training"
       training_condition == "active") { 
       /* Set up keypress event
        * While the z key is pressed user can scale antenna
        * After the x key is pressed user can rotate antenna 
        */
        $(document).keydown(function(event){
              //event.preventDefault();
              var keys = {"z": 90, "x": 88, "space_bar": 32};
              switch(event.which) {
                case keys["z"]:
                    circle.undrag(); // unbinds any prior event listener 
                    circle.drag(scaleAntenna, start, up);
                    break;
                case keys["x"]:
                    circle.undrag(); // unbinds any prior event listener 
                    circle.drag(rotateAntenna, start, up);
                    break;
                case keys["space_bar"]:
                    //add check to make sure user has interacted with antenna
                    if(trial.radius == Math.round(circle.attr("r")) &
                       trial.angle == Math.round(line.matrix.split().rotate)) {
                        alert("Please adjust the antenna to learn the station")
                    } else {
                      $(document).unbind("keydown")
                      var radius_response = Math.round(circle.attr("r"));
                      var orientation_response = Math.round(line.matrix.split().rotate);
                      var category_response;
                        // if order1 then check antenna radius, else check orientation
                        if(order == "order1") {
                           if (radius_response < optimal_decision_boundary_stim) {
                            $("#category").text("1");
                            $(".category_label").attr("style", "visibility: visible"); 
                            category_response = "A";
                            } else {
                                $("#category").text("2");
                                $(".category_label").attr("style", "visibility: visible"); 
                                category_response = "B";
                            }
                        } else {
                            if (orientation_response < optimal_decision_boundary_stim) {
                            $("#category").text("1");
                            $(".category_label").attr("style", "visibility: visible"); 
                            category_response = "A";
                            } else {
                                $("#category").text("2");
                                $(".category_label").attr("style", "visibility: visible"); 
                                category_response = "B";
                            }
                        }
                       
                      setTimeout(function(){
                        logDataTraining(category_response, radius_response, orientation_response);
                      }, 1500)
                      
                    }
                default:
              }
          });
    } else if(trial.trial_type == "training" & // this should be "training"
              training_condition == "receptive") {
            // delay the timing of event handler so user can't respond before seeing the channel label
            setTimeout(function(){
              // user must press Z for channel 1 and X for channel 2
            $(document).keydown(function(event){
                  var keys = {"z": 90, "x": 88, "space_bar": 32};
                   switch(event.which) {
                    case keys["z"]:
                        if(trial.antenna_category == "A") {
                          $("#channel_label").css("border", "3px solid green")
                          logDataTraining();
                        } else {
                          alert("Press Z for Channel 1 and X for Channel 2");
                        }
                        break;
                    case keys["x"]:
                        if(trial.antenna_category == "B") {
                          $("#channel_label").css("border", "3px solid green")
                          logDataTraining();
                        } else {
                          alert("Press Z for Channel 1 and X for Channel 2");
                        }
                        break;
                    default:
                    } 
              });       
            }, 1000)
            

    } else {
        //add event listeners to table so user can select a channel
        $("#channel_1").click(function() {
          var test_response = "A"; // store response
          // hide channel table and show slider bar
            setTimeout(function() {
              $("#test_instructions").attr("style", "display: none");
              $("#category_table").attr("style", "display: none");
              $("#slider_instructions").attr("style", "display: block");
              $("#slider_instructions2").attr("style", "display: block");
              $("#slider_table").attr("style", "display: block");
            }, 250);
          // add keypress event listener, so user can submit confidence response
            $(document).keydown(function(event){
                var keys = {"space_bar": 32};
                if(event.which == keys['space_bar']) {
                    if(slider_check == true) {
                      logDataTest(test_response);
                     } else {
                      alert("Please adjust the slider to report your confidence")
                     }
                }
            });

        });

        //add event listeners to table so user can select a channel
        $("#channel_2").click(function() {
          var test_response = "B"; // store response

          // hide channel table and show slider bar
            setTimeout(function() {
              $("#test_instructions").attr("style", "display: none");
              $("#category_table").attr("style", "display: none");
              $("#slider_instructions").attr("style", "display: block");
              $("#slider_instructions2").attr("style", "display: block");
              $("#slider_table").attr("style", "display: block");
            }, 250);
          // add keypress event listener, so user can submit confidence response
            $(document).keydown(function(event){
                //event.preventDefault;
                var keys = {"space_bar": 32};
                if(event.which == keys['space_bar']) {
                    if(slider_check == true) {
                      logDataTest(test_response);
                     } else {
                      alert("Please adjust the slider to report your confidence")
                     }
                }
            });

        });
    };

    // display slide
    showSlide("stage");
  }
};