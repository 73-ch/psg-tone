import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import CompareNoise from "@/views/CompareNoise";
import Sequencer from "@/views/Sequencer";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/compare_noise",
    name: "CompareNoise",
    component: CompareNoise
  },
  {
    path: "/sequencer",
    name: "Sequencer",
    component: Sequencer
  }
];

const router = new VueRouter({
  routes
});

export default router;
