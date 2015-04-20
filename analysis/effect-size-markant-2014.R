# calculate effect size for Markant and Gureckis, 2014 active learning expt

library(compute.es)

# relevant values from ind t.test
t.val <- 1.82
n.1 <- 30
n.2 <- 30

es <- tes(t.val, n.1, n.2)

cohens.d <- es$d
