library(rjson)
library(ggplot2)

########### Training Trials
n_blocks <- 6
n_trials_in_block <- 16
n_trials <- n_blocks * n_trials_in_block
n_trials_cat <- n_trials / 2

##### Category A1
a1.rad.mean <- 220
a1.rad.sd <- sqrt(2000)
a1.orientation.mean <- 300
a1.orientation.sd <- sqrt(9000)
a1_radii <- floor(rnorm(n_trials_cat, mean = a1.rad.mean, sd = a1.rad.sd))
a1_orientations <- floor(rnorm(n_trials_cat, mean = a1.orientation.mean, sd = a1.orientation.sd))

# now convert to json 
toJSON(a1_radii)
toJSON(a1_orientations)

##### Category B1
b1.rad.mean <- 380
b1.rad.sd <- sqrt(2000)
b1.orientation.mean <- 300
b1.orientation.sd <- sqrt(9000)
b1_radii <- floor(rnorm(n_trials_cat, mean = b1.rad.mean, sd = b1.rad.sd))
b1_orientations <- floor(rnorm(n_trials_cat, mean = b1.orientation.mean, sd = b1.orientation.sd))

# now convert to json 
toJSON(b1_radii)
toJSON(b1_orientations)

#### Category A2
a2.rad.mean <- 300
a2.rad.sd <- sqrt(9000)
a2.orientation.mean <- 220
a2.orientation.sd <- sqrt(2000)
a2_radii <- floor(rnorm(n_trials_cat, mean = a2.rad.mean, sd = a2.rad.sd))
a2_orientations <- floor(rnorm(n_trials_cat, mean = a2.orientation.mean, sd = a2.orientation.sd))

# now convert to json 
toJSON(a2_radii)
toJSON(a2_orientations)

##### Category B2
b2.rad.mean <- 300
b2.rad.sd <- sqrt(9000)
b2.orientation.mean <- 380
b2.orientation.sd <- sqrt(2000)
b2_radii <- floor(rnorm(n_trials_cat, mean = b2.rad.mean, sd = b2.rad.sd))
b2_orientations <- floor(rnorm(n_trials_cat, mean = b2.orientation.mean, sd = b2.orientation.sd))

# now convert to json 
toJSON(b2_radii)
toJSON(b2_orientations)

########### Map parameters to perceptual space with scale factor 
# scale factor = ratio of the range of your two scales

# parameter space scale
min_param_scale <- 1
max_param_scale <- 600
range_param_scale <- max_param_scale - min_param_scale

# stimulus space scale (radius)
min_stim_scale <- 15
max_stim_scale <- 255
range_stim_scale <- max_stim_scale - min_stim_scale

# each sub will have different scale factor 
# need different scale factor for radius and orientation
get_scale_factor <- function(min_param, max_param, min_stim, max_stim) {
    range_param <- max_param - min_param
    range_stim <- max_stim - min_stim
    scale_factor <- range_param / range_stim
    scale_factor
}

convert_param_to_stim <- function(param_value, scale_factor, min_stim_scale) {
    stim_value <- floor((param_value / scale_factor) + min_stim_scale)
    stim_value
}

convert_stim_to_param <- function(stim_value, scale_factor, min_stim_scale, min_param_scale) {
    param_value <- floor(((stim_value - min_stim_scale) * scale_factor) + min_param_scale)
    param_value
}

# test functions
sf <- get_scale_factor(1,600,2,152)
min_stim_scale <- 2
min_param_scale <- 1

convert_param_to_stim(param_value = 308, scale_factor = sf, min_stim_scale = min_stim_scale)

convert_stim_to_param(stim_value = 255, scale_factor = sf, min_stim_scale = min_stim_scale,
                      min_param_scale = min_param_scale)


########### Test trials

# uniform grid across parameter space
# randomly sample from each quadrant such that
# each block has 8 trials from each
# then shuffle those

test_trials_block <- 32
n_test_trials <- n_blocks * test_trials_block
n_trials_quadrant <- test_trials_block / 4

# make quadrants in parameter space 
quad1.x <- seq(1, 300)
quad1.y <- seq(301, 600)
quad2.x <- seq(301, 600)
quad2.y <- seq(301, 600)
quad3.x <- seq(1, 300)
quad3.y <- seq(1, 300)
quad4.x <- seq(301, 600)
quad4.y <- seq(1, 300)

# write function that samples from each of these quadrants
# no inputs
# returns an array of values, 8 from each quadrant, in parameter space
rand.quad <- function() {
    radius.vals <- vector()
    orientation.vals <- vector()
    for (i in 1:n_blocks) {
        for (j in 1:n_trials_quadrant) {
            radius.vals <- c(radius.vals, sample(quad1.x, 1))
            radius.vals <- c(radius.vals, sample(quad2.x, 1))
            radius.vals <- c(radius.vals, sample(quad3.x, 1))
            radius.vals <- c(radius.vals, sample(quad4.x, 1))
            orientation.vals <- c(orientation.vals, sample(quad1.y, 1))
            orientation.vals <- c(orientation.vals, sample(quad2.y, 1))
            orientation.vals <- c(orientation.vals, sample(quad3.y, 1))
            orientation.vals <- c(orientation.vals, sample(quad4.y, 1))
        }
    }
    list.vals <- list("radii" = radius.vals, "angles" = orientation.vals)
    
    return(list.vals)
}

test.trials.vals <- rand.quad()

# convert to JSON
toJSON(test.trials.vals)





